import requests
import os
from babelfish import Language
from subliminal import download_best_subtitles, Episode

TMDB_API_KEY = os.environ['TMDB_API_KEY']
POPULAR_TV_SHOWS_URL = 'https://api.themoviedb.org/3/tv/popular' 
TV_URL = 'https://api.themoviedb.org/3/tv/%s'

def download_subtitles(series, season, episode):
    file_name = 'subtitles/%s_S%s_E%s.srt' % (series, season, episode)
    if os.path.isfile(file_name):
        return

    video = Episode(series, series, season, episode)
    languages = {Language('eng')}
    subtitles = download_best_subtitles(set([video]), languages)
    for subtitle in subtitles.values():
        if subtitle:
            with open(file_name, 'wb') as f:
                f.write(subtitle[0].content)

def get_top_tv_show_subtitles():
    for i in range(1):
        params = {'api_key' : TMDB_API_KEY, 'language': 'en-US', 'page': i + 1}
        r = requests.get(url = POPULAR_TV_SHOWS_URL, params = params)
        popular_tv_show = r.json()
        for tv_show in popular_tv_show['results']:
            params = {'api_key' : TMDB_API_KEY}
            r = requests.get(url = TV_URL % tv_show['id'], params = params)
            tv_show = r.json()
            for season in tv_show['seasons']:
                threads = []
                for e in range(season['episode_count']):
                    # +1 as seasons and episodes are generally 1 indexed
                    download_subtitles(tv_show['name'], season['season_number'] + 1, e + 1)

get_top_tv_show_subtitles()
