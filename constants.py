POPULAR_TV_SHOWS_URL = 'https://api.themoviedb.org/3/tv/popular' 
TV_URL = 'https://api.themoviedb.org/3/tv/%s'
SUBTITLES_DIR = 'subtitles'
INDEX_DIR = 'index'
INDEX_MARKER_DIR = 'index_marker'
REFERENCE_GRAPH = 'reference_graph'

# Show name is too common, will be used not as a reference, restrict which shows can be 'referenced'
TV_SHOW_DENYLIST = set([
'Bleach',
'Law & Order',
'Charmed',
'Castle',
'Supernatural',
'Bones',
'South Park',
'NCIS',
'9-1-1',
'Grimm',
'Suits',
'The Flash',
'The Blacklist',
'Prison Break',
'Chicago P.D.',
'Law & Order: Special Victims Unit',
'Once',
'Vikings',
'Lost',
'Legacies',
'Elite',
'The Boys',
'Leverage',
'Chucky',
'The Baby',
'Peacemaker',
'What If...?',
'The Office',
'The Rookie',
'Friends',
'House',
'The 100',
'The Quest',
'Lucifer',
'Shameless',
'Robinson',
'Regular Show',
'The Good Doctor',
'All of Us Are Dead',
'Conan',
'Bel-Air',
'S.W.A.T.',
'Loki',
'Scorpion',
'One Piece',
'Invasion'
])
