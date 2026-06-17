# AGENTS.md

Guidance for coding agents (and humans) working in this repo.

## What this project is

Finds **Cyclic TV Reference Paradoxes**: cycles in a graph where show A's
dialogue references show B as a fictional TV show, B references C, ... and the
chain loops back. Two halves:

- `reference_gen_scripts/` — Python pipeline that scrapes subtitles, indexes
  them, finds references, emits CSVs.
- `web_app/` — Create React App (TypeScript) visualizing the graph with
  `react-force-graph`. Reads `public/references.csv` + `public/tv_shows.csv` at
  runtime.

## Data pipeline (reference_gen_scripts)

1. **`get_top_tv_show_subtitles.py`** — original downloader. Uses TMDB
   (`TMDB_API_KEY` env) to list popular shows + season/episode counts, then
   `subliminal` to fetch English `.srt` into `subtitles/`.
2. **`get_subtitles_from_list.py`** — *added* TMDB-free alternative. Reads an
   existing `tv_shows.csv` and probes seasons/episodes directly via subliminal.
   Resumable via `subtitles/<show>_DONE` markers. Env knobs: `MAX_SEASONS`,
   `MAX_EPISODES`, `EPISODE_MISS_LIMIT`.
3. **`index_srts.py`** — indexes `subtitles/*.srt` into a Whoosh index
   (`index/`). Runs forever (polls); uses `index_marker/` markers.
4. **`gen_output_data.py`** — searches each show title inside every other
   show's subtitles to build candidate references, validates them (LLM step),
   writes `references.csv` + `tv_shows.csv`.
5. **`llm_reference_check.py`** — *added*. Validates candidate references with an
   LLM via the exe.dev gateway. Replaces the old hand-maintained
   `TV_SHOW_DENYLIST`.
6. **`find_cycles_in_references.py`** — DFS over `references.csv` to print cycles
   (standalone debug tool; the web app computes cycles itself in JS).

### Subtitle filename convention (IMPORTANT)

Everything keys off the filename: `<Show Name>_S<season>_E<episode>.srt`
(e.g. `Rick and Morty_S1_E1.srt`). The text before the first `_` becomes the
show/node name. Imported subtitles MUST follow this or they won't index right.

### LLM reference validation

`llm_reference_check.py` asks an LLM, per candidate, whether a subtitle line is
genuinely referencing the named show vs. coincidental wording ("we are lost" is
NOT a reference to *Lost*; "did you watch last night's Lost?" IS).

- Gateway (no API key needed in the VM):
  `http://169.254.169.254/gateway/llm/anthropic/v1/messages`. Default model
  `claude-haiku-4-5`.
- **Cost controls:** hard cap `LLM_REFERENCE_MAX_USD` (default **$5**). When real
  spend hits it, validation stops and remaining candidates are KEPT (permissive),
  never silently dropped. Prints a pre-flight projection. Prompt caching + rate
  limit (`LLM_REFERENCE_MAX_RPS`, default 5).
- **Incremental cache:** verdicts persist to `llm_reference_cache.json` keyed by
  (show title + normalized text). Re-runs only spend on new lines.
- `TV_SHOW_DENYLIST` in `constants.py` is now DEPRECATED/unused (kept for
  history). `UNIVERSES` (intra-universe grouping) is still applied.

### Running the Python pipeline

```bash
cd reference_gen_scripts
uv venv .venv && source .venv/bin/activate
uv pip install whoosh requests babelfish subliminal jsonpickle pysrt
```

## Web app

```bash
cd web_app
npm install --legacy-peer-deps   # react-ga forces an old react peer
PORT=8000 HOST=0.0.0.0 DANGEROUSLY_DISABLE_HOST_CHECK=true WDS_SOCKET_PORT=0 BROWSER=none npm start
```

- Node via nodeenv (`~/node`, symlinked into `~/.local/bin`).
- Deploys to GitHub Pages (`npm run deploy`); see `homepage` in package.json.
- **Mobile-friendly** (added): the app used to hard-block phones via `is-mobile`;
  removed. CSS `@media (max-width:768px)` stacks the graph on top and the side
  panel below; `GraphVisual.tsx` sizes the canvas to its container via a
  `ResizeObserver`.

## exe.dev VM notes

- Default port 8000. Owner reaches services via the proxy:
  `https://cyclic-tv-reference-paradox-finder.exe.xyz/`.
- LLM gateway and `https://notify.int.exe.xyz/` (push) work without keys.
- **scp/sftp is NOT supported on the exe.dev gateway.** Copy files in via
  scp/rsync against the VM hostname (`<vm>.exe.xyz`, e.g.
  `cyclic-tv-reference-paradox-finder.exe.xyz`) or tar-over-ssh:
  `tar cf - . | ssh <vm>.exe.xyz 'tar xf - -C <dir>'`.

## Subtitle corpus transfer (2026-06)

The owner had a prior full subtitle download (~41k `.srt` files) on their laptop.
Rather than re-scrape (slow; subliminal providers rate-limit hard), they
transferred it via tar-over-ssh into `reference_gen_scripts/incoming/`. Files
already use the correct `Show_S#_E#.srt` naming. `incoming/` also holds the old
scraper's non-`.srt` season markers (e.g. `The Office_S6`) — ignore those; only
`*.srt` get indexed.

Plan after transfer: stop the slow background scrape, merge `incoming/*.srt`
into `subtitles/`, re-index, run `gen_output_data.py` (LLM validation, $5 cap),
copy fresh CSVs into `web_app/public/`, notify owner. tmux sessions used during
this work: `scrape`, `indexer`, `rebuild`, `watchdog`, `web`.

## Conventions

- Don't commit generated data/CSVs, caches, or the venv.
- Keep the subtitle filename convention intact across new tooling.
- Prefer the LLM validator over reintroducing hardcoded show denylists.
