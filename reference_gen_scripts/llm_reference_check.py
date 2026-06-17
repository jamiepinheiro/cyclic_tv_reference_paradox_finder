"""LLM-based reference validation.

Historically the pipeline used a large hand-maintained TV_SHOW_DENYLIST in
constants.py to drop shows whose names are common English words/phrases
(e.g. "Lost", "House", "24", "Friends"). That is brittle and throws away real
references.

Instead, we keep every show and ask an LLM, per candidate match, whether the
subtitle line is *actually* referring to the TV show. For example:

  show="Lost"  text="We are lost in the woods."         -> NOT a reference
  show="Lost"  text="Did you watch yesterday's Lost?"    -> a reference

Uses the exe.dev LLM gateway (no API keys needed inside the VM):
  http://169.254.169.254/gateway/llm/anthropic/v1/messages

Results are cached on disk so re-runs are cheap and resumable.
"""
import json
import os
import threading
import time
import urllib.request
from concurrent.futures import ThreadPoolExecutor, as_completed

GATEWAY_URL = os.environ.get(
    "LLM_GATEWAY_URL",
    "http://169.254.169.254/gateway/llm/anthropic/v1/messages",
)
MODEL = os.environ.get("LLM_REFERENCE_MODEL", "claude-haiku-4-5")
CACHE_FILE = os.environ.get("LLM_REFERENCE_CACHE", "llm_reference_cache.json")
MAX_WORKERS = int(os.environ.get("LLM_REFERENCE_WORKERS", "8"))

# ---- Cost controls -------------------------------------------------------
# Hard ceiling on estimated spend for a single run. Once the running estimate
# crosses this, we STOP issuing new LLM calls; any not-yet-validated candidates
# are kept (permissive) rather than silently dropped.
MAX_USD = float(os.environ.get("LLM_REFERENCE_MAX_USD", "5"))
# Per-million-token prices for the chosen model (haiku-4-5 defaults). cacheRead
# is what the large fixed system prompt costs after the first call.
PRICE_IN = float(os.environ.get("LLM_PRICE_IN_PER_M", "1.0"))
PRICE_OUT = float(os.environ.get("LLM_PRICE_OUT_PER_M", "5.0"))
PRICE_CACHE_READ = float(os.environ.get("LLM_PRICE_CACHE_READ_PER_M", "0.1"))
PRICE_CACHE_WRITE = float(os.environ.get("LLM_PRICE_CACHE_WRITE_PER_M", "1.25"))
# Rough token estimates used for the pre-flight projection only (actual spend
# is tracked from real usage returned by the API).
EST_SYS_TOK = 330      # fixed system prompt (cached after first call)
EST_USER_TOK = 60      # per-line user message
EST_OUT_TOK = 5        # "yes"/"no"
# Requests/second ceiling across all workers (gentle on the gateway).
MAX_RPS = float(os.environ.get("LLM_REFERENCE_MAX_RPS", "5"))

_lock = threading.Lock()
_cache = None

# Running spend + rate-limit state (process-wide).
_spent_usd = 0.0
_budget_stop = False
_rl_lock = threading.Lock()
_next_slot = 0.0


def estimated_cost_per_query():
    """Rough USD per validated candidate, assuming system prompt is cached."""
    return (
        EST_USER_TOK * PRICE_IN / 1e6
        + EST_SYS_TOK * PRICE_CACHE_READ / 1e6
        + EST_OUT_TOK * PRICE_OUT / 1e6
    )


def _rate_limit():
    if MAX_RPS <= 0:
        return
    global _next_slot
    with _rl_lock:
        now = time.monotonic()
        wait = _next_slot - now
        if wait > 0:
            time.sleep(wait)
            now = time.monotonic()
        _next_slot = max(now, _next_slot) + 1.0 / MAX_RPS


def _record_usage(usage):
    """Add the real cost of one call to the running total."""
    global _spent_usd, _budget_stop
    if not usage:
        return
    inp = usage.get("input_tokens", 0)
    out = usage.get("output_tokens", 0)
    cr = usage.get("cache_read_input_tokens", 0)
    cw = usage.get("cache_creation_input_tokens", 0)
    cost = (
        inp * PRICE_IN
        + out * PRICE_OUT
        + cr * PRICE_CACHE_READ
        + cw * PRICE_CACHE_WRITE
    ) / 1e6
    with _lock:
        _spent_usd += cost
        if MAX_USD > 0 and _spent_usd >= MAX_USD and not _budget_stop:
            _budget_stop = True
            print(
                "  !! LLM budget cap reached: spent ~$%.2f (cap $%.2f). "
                "Remaining candidates kept un-validated."
                % (_spent_usd, MAX_USD)
            )


def spent_usd():
    with _lock:
        return _spent_usd


def _load_cache():
    global _cache
    if _cache is not None:
        return _cache
    if os.path.isfile(CACHE_FILE):
        try:
            with open(CACHE_FILE) as f:
                _cache = json.load(f)
        except Exception:
            _cache = {}
    else:
        _cache = {}
    return _cache


def _save_cache():
    with _lock:
        tmp = CACHE_FILE + ".tmp"
        with open(tmp, "w") as f:
            json.dump(_cache, f)
        os.replace(tmp, CACHE_FILE)


def _key(show_title, text):
    return "%s\u0000%s" % (show_title.lower().strip(), " ".join(text.split()))


SYSTEM_PROMPT = (
    "You decide whether a line of TV-show dialogue is genuinely referring to "
    "another TV show by name (a meta 'TV reference'), as opposed to a "
    "coincidental use of the same words.\n"
    "A genuine reference treats the named title as a TV show/franchise/its "
    "characters that exists in the speaker's world (e.g. watching it, naming "
    "an episode, quoting it, a character from it).\n"
    "It is NOT a reference when the words just happen to match the title in "
    "ordinary speech.\n"
    "Examples:\n"
    "  show='Lost'  line='We are lost in the woods.'           -> no\n"
    "  show='Lost'  line=\"Did you catch last night's Lost?\"   -> yes\n"
    "  show='House' line='Come back to my house.'               -> no\n"
    "  show='House' line='He thinks he is Dr. House or something.' -> yes\n"
    "  show='Friends' line='We are just friends.'               -> no\n"
    "  show='Friends' line='I was watching Friends reruns.'     -> yes\n"
    "Answer with exactly one word: yes or no."
)


def _ask_llm(show_title, text):
    body = {
        "model": MODEL,
        "max_tokens": 5,
        # Mark the big fixed system prompt as cacheable so repeated calls pay
        # the cheap cache-read price instead of full input price.
        "system": [
            {
                "type": "text",
                "text": SYSTEM_PROMPT,
                "cache_control": {"type": "ephemeral"},
            }
        ],
        "messages": [
            {
                "role": "user",
                "content": "show=%r  line=%r\nIs this line a genuine reference to the TV show? Answer yes or no."
                % (show_title, text),
            }
        ],
    }
    _rate_limit()
    req = urllib.request.Request(
        GATEWAY_URL,
        data=json.dumps(body).encode(),
        headers={
            "content-type": "application/json",
            "anthropic-version": "2023-06-01",
        },
    )
    with urllib.request.urlopen(req, timeout=60) as resp:
        data = json.loads(resp.read())
    _record_usage(data.get("usage"))
    parts = data.get("content", [])
    out = " ".join(p.get("text", "") for p in parts if p.get("type") == "text")
    return out.strip().lower().startswith("y")


def is_reference(show_title, text):
    """Return True if `text` genuinely references the TV show `show_title`."""
    cache = _load_cache()
    k = _key(show_title, text)
    if k in cache:
        return cache[k]
    try:
        verdict = _ask_llm(show_title, text)
    except Exception as e:  # network/transient -> be permissive, don't cache
        print("  ! LLM check failed for %r: %s" % (show_title, e))
        return True
    with _lock:
        cache[k] = verdict
    return verdict


def filter_references(references, on_progress=None):
    """Filter a list of objects exposing .reference_title and .text.

    Validates uncached items concurrently, then returns the kept subset
    preserving input order. Caches everything to disk.
    """
    cache = _load_cache()
    todo = []
    for r in references:
        if _key(r.reference_title, r.text) not in cache:
            todo.append(r)

    total = len(todo)
    # Pre-flight projection so a huge candidate set is visible before spending.
    per = estimated_cost_per_query()
    projected = total * per
    print(
        "  LLM pre-flight: %d uncached candidates x ~$%.5f = ~$%.2f projected "
        "(budget cap $%.2f, model %s)"
        % (total, per, projected, MAX_USD, MODEL)
    )
    if MAX_USD > 0 and projected > MAX_USD:
        print(
            "  NOTE: projection exceeds the $%.2f cap; validation will stop "
            "early and keep the remaining candidates un-validated." % MAX_USD
        )

    done = 0
    if total:
        def worker(r):
            # Respect the budget cap: once tripped, don't issue more calls.
            if _budget_stop:
                return r, None  # None => keep (permissive), don't cache
            try:
                return r, _ask_llm(r.reference_title, r.text)
            except Exception as e:
                print("  ! LLM check failed for %r: %s" % (r.reference_title, e))
                return r, True  # permissive on failure

        with ThreadPoolExecutor(max_workers=MAX_WORKERS) as ex:
            futs = {ex.submit(worker, r): r for r in todo}
            for fut in as_completed(futs):
                r, verdict = fut.result()
                if verdict is not None:
                    with _lock:
                        cache[_key(r.reference_title, r.text)] = verdict
                done += 1
                if on_progress and done % 25 == 0:
                    on_progress(done, total)
                    print("     (spent ~$%.2f so far)" % spent_usd())
                    _save_cache()
        _save_cache()
        print("  LLM validation finished. Actual spend this run: ~$%.2f" % spent_usd())

    return [r for r in references if cache.get(_key(r.reference_title, r.text), True)]


if __name__ == "__main__":
    # quick smoke test
    tests = [
        ("Lost", "We are lost in the woods."),
        ("Lost", "Did you catch last night's episode of Lost?"),
        ("House", "Come back to my house."),
        ("Friends", "I was watching Friends reruns all weekend."),
    ]
    for show, line in tests:
        print("%-8s | %-45s -> %s" % (show, line, is_reference(show, line)))
