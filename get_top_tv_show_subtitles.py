import requests
import os
import time
from babelfish import Language
from subliminal import download_best_subtitles, Episode

TMDB_API_KEY = os.environ['TMDB_API_KEY']
POPULAR_TV_SHOWS_URL = 'https://api.themoviedb.org/3/tv/popular' 
TV_URL = 'https://api.themoviedb.org/3/tv/%s'
DIR = 'subtitles'

def download_subtitles_for_season(series, season, num_episode):
    # avoid redownloading if done already present
    marker_file = '%s/%s_S%s' % (DIR, series, season)
    print("Getting %s" % marker_file)
    if os.path.isfile(marker_file):
        return None

    start_time = time.time()

    videos = set([Episode(series, series, season, e + 1) for e in range(num_episode)])
    languages = {Language('eng')}
    subtitles = download_best_subtitles(videos, languages)
    for video, subs in subtitles.items():
        file_name = '%s/%s_S%s_E%s.srt' % (DIR, series, season, video.episode)
        if subs:
            with open(file_name, 'wb') as f:
                f.write(subs[0].content)

    subtitles_found = len([s for s in subtitles.values() if s])
    with open(marker_file, 'w'):
        print("Found %d subtitles in %fs" % (subtitles_found, time.time() - start_time))
    
    return subtitles_found

def get_top_tv_show_subtitles():
    for i in range(100):
        params = {'api_key' : TMDB_API_KEY, 'language': 'en-US', 'page': i + 1}
        r = requests.get(url = POPULAR_TV_SHOWS_URL, params = params)
        popular_tv_show = r.json()
        for tv_show in popular_tv_show['results']:
            params = {'api_key' : TMDB_API_KEY}
            r = requests.get(url = TV_URL % tv_show['id'], params = params)
            tv_show = r.json()
            for s, season in enumerate(tv_show['seasons']):
                # +1 as seasons and episodes are generally 1 indexed
                found_subs = download_subtitles_for_season(tv_show['name'], s + 1, season['episode_count'])
                # if subs aren't found for one season, skip the rest of the seasons
                if found_subs and found_subs == 0:
                    continue

get_top_tv_show_subtitles()
