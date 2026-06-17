"""TMDB-free subtitle downloader.

The original get_top_tv_show_subtitles.py needs a TMDB_API_KEY to (a) enumerate
popular shows and (b) get each show's season/episode counts. This variant reuses
the already-known show list (tv_shows.csv) and *probes* seasons/episodes via the
subtitle providers directly, so no TMDB key is required. Resumable via the same
marker-file scheme as the original.
"""
import csv
import os
import sys
import time
from constants import SUBTITLES_DIR
from babelfish import Language
from subliminal import download_best_subtitles, Episode, region

region.configure('dogpile.cache.dbm',
                 arguments={'filename': 'subliminal.cache.dbm'},
                 replace_existing_backend=True)

LANG = {Language('eng')}
MAX_SEASONS = int(os.environ.get('MAX_SEASONS', '12'))
MAX_EPISODES = int(os.environ.get('MAX_EPISODES', '26'))
# stop a season after this many consecutive misses (handles gaps / rate limits)
EPISODE_MISS_LIMIT = int(os.environ.get('EPISODE_MISS_LIMIT', '3'))


def load_titles(path):
    titles = []
    with open(path) as f:
        for row in csv.reader(f):
            if not row or row[0] == 'title':
                continue
            titles.append(row[0])
    return titles


def download_episode(series, season, episode):
    fname = '%s/%s_S%s_E%s.srt' % (SUBTITLES_DIR, series, season, episode)
    if os.path.isfile(fname):
        return True
    videos = {Episode(series, series, season, episode)}
    try:
        subs = download_best_subtitles(videos, LANG)
    except Exception as e:  # noqa
        print('  ! %s S%sE%s error: %s' % (series, season, episode, e))
        return False
    for _, found in subs.items():
        if found and found[0].content:
            with open(fname, 'wb') as fh:
                fh.write(found[0].content)
            return True
    return False


def download_show(series):
    marker = '%s/%s_DONE' % (SUBTITLES_DIR, series)
    if os.path.isfile(marker):
        print('= %s already scraped' % series)
        return
    print('# %s' % series)
    total = 0
    for season in range(1, MAX_SEASONS + 1):
        season_hits = 0
        misses = 0
        for episode in range(1, MAX_EPISODES + 1):
            ok = download_episode(series, season, episode)
            if ok:
                season_hits += 1
                total += 1
                misses = 0
            else:
                misses += 1
                if misses >= EPISODE_MISS_LIMIT:
                    break
        print('  S%s: %d episodes' % (season, season_hits))
        if season_hits == 0:
            break
    with open(marker, 'w') as fh:
        fh.write(str(total))
    print('  -> %d episodes for %s' % (total, series))


def main():
    if not os.path.exists(SUBTITLES_DIR):
        os.makedirs(SUBTITLES_DIR)
    path = sys.argv[1] if len(sys.argv) > 1 else '../web_app/public/tv_shows.csv'
    titles = load_titles(path)
    print('Loaded %d titles from %s' % (len(titles), path))
    for i, t in enumerate(titles):
        print('[%d/%d]' % (i + 1, len(titles)), end=' ')
        download_show(t)


if __name__ == '__main__':
    main()
