POPULAR_TV_SHOWS_URL = 'https://api.themoviedb.org/3/tv/popular'
TV_URL = 'https://api.themoviedb.org/3/tv/%s'
SUBTITLES_DIR = 'subtitles'
INDEX_DIR = 'index'
INDEX_MARKER_DIR = 'index_marker'
REFERENCE_GRAPH = 'reference_graph'
REFERENCES_CSV = 'references.csv'
REFERENCES_DENYLIST_CSV = 'references_denylist.csv'
TV_SHOWS_CSV = 'tv_shows.csv'

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
    'Invasion',
    'FBI',
    'Naomi',
    'The Return',
    'Dark',
    'The A-Team',
    'Once Upon a Time',
    'Arrow',
    'Dark',
    'The Boat',
    'Chicago Med',
    'Night Sky',
    'BAKI',
    'The Resident',
    'Ragnarok',
    'Record of Ragnarok',
    'Titans',
    'Foundation',
    'Happiness',
    '9-1-1: Lone Star',
    'Insatiable',
    'FBI: Most Wanted',
    'The Originals',
    'Tomorrow',
    'Invincible',
    'Monk',
    'Seal team',
    'Bosch',
    'Scrubs',
    'Yellowstone',
    'Chicago Fire',
    'Business Proposal',
    'Day of the Dead',
    'One of Us Is Lying',
    'Midnight Mass',
    'Arcane',
    'Raised by Wolves',
    'La Brea',
    'SEAL Team',
    'The Mentalist',
    'El Chapo',
    'Who Killed Sara?',
    'Desperate Housewives',
    'The Last Kingdom',
    'Spartacus',
    'Baki Hanma',
    'Running Man',
    'Big Brother',
    'JAG',
    'Angel',
    'ER',
    'In Treatment',
    'Heels',
    'Medium',
    'Dexter',
    'The Fosters',
    'Fairy Tail',
    'Ballers',
    'The Good Wife',
    'Misfits',
    'Adventure Time',
    'Serve and Protect'
    'Ancient Aliens',
    'The Last Man on Earth',
    'Snowfall',
    'Sweet Tooth',
    'Gomorrah',
    'House of Cards',
    'New Amsterdam',
    'Doom Patrol',
    'Lupin',
    'Designated Survivor',
    'Heartland',
    'Saint Seiya',
    'Saint Seiya Omega',
    'Van Helsing',
    'Narcos',
    'Teen Wolf',
    'NYPD Blue',
    'Early Edition',
    'The Dead Zone',
    '90210',
    'Babylon 5',
    'Under the Dome',
    'Bonanza',
    'Bates Motel',
    'Last Man Standing',
    'Lethal Weapon',
    'ALF',
    'Sex Education',
    'Inside No. 9',
    'The Storyteller',
    'Perry Mason',
    'The White Princess',
    'Mr. Pickles',
    'Crash Landing on You',
    'FBI: International',
    'Young Rock',
    'Girl from Nowhere',
    'Hell Girl',
    'Big Sky',
    'Drawn Together',
    'Stairway to Heaven',
    'Atypical',
    'Private Eyes',
    'Monsters at Work',
    'Silent Witness',
    'Just Beyond',
    'A Love So Beautiful',
    'Good Girls',
    'Candy Candy',
    'Reacher',
    '4400',
    'The Wilds',
    '1883',
    'The Wheel of Time',
    'I Know What You Did Last Summer',
    'Good Trouble',
    'Pachinko',
    'Frontline',
    'Hellbound',
    'Ratched',
    'Slow Horses',
    'Vincenzo',
    'Serve and Protect',
    'Ancient Aliens',
    'Big Brother',
    'JAG',
    'Wentworth',
    'Angel',
    'Power Rangers',
    'ER',
    'In Treatment',
    'Heels',
    'Medium',
    'All American',
    'Silicon Valley',
    'New Girl',
    'Dexter',
    'Elementary',
    'Person of Interest',
    '24',
    'Home Alone',
    'Merlin',
    'Will & Grace',
    'Scandal',
    'Chuck',
    'Sex and the City',
    'Vera',
    'My Name',
    'Strike Back',
    'Fringe',
    'Archer',
    'Frasier',
    'Clarence',
    'Jessie',
    'The Nanny',
    'Psych',
    'Shooter',
    'Homeland',
    'The Middle',
    'HIStory',
    'The Fugitive',
    'The Expanse',
    'Cheers',
    'The Good Fight',
    'Dallas',
    'NOVA',
    'Louie',
    'Hawaii Five-O',
    'The Walking Dead',
    'Sweet Home',
    'Dynasty',
    'Skins',
    'Baby Daddy',
    'X-Men',
    'Eureka',
    'Reign',
    'Revenge',
    'The Crown',
    'The Stand',
    'The Closer',
    'Community',
    'Sherlock',
    'Bull',
    'Initial D',
    'Billions',
    'The Wire',
    'Travelers',
    'Glee',
    'Doctors',
    'Lie to Me',
    'Smallville',
    'The Shield',
    'White Collar',
    'The Penthouse',
    'Control Z',
    'Survivor',
    'Walker',
    'The Protector',
    'Banshee',
    'Mom',
    'Teen Titans',
    'Awkward.',
    'Heroes',
    'The Americans',
    'Fresh Off the Boat',
    'Damages',
    'Z Nation',
    'Power',
    'Upload',
    'The Flight Attendant',
    'Acapulco',
    'The Strain',
    'Timeless',
    'Siren',
    'Victorious',
    'Justified',
    'Doctor Who',
    'Another',
    'The Sinner',
    'Nature',
    'The Neighborhood',
    'The Good Place',
    'Spider-Man',
    'Manifest',
    'Ben 10',
    'Kung Fu',
    'The Purge',
    'Fargo',
    'Barry',
    'Servant',
    'Succession',
    'Are You Afraid of the Dark?',
    'DAS!',
    'Grace',
    'The Pacific',
    'Shake It Up',
    'Close Enough',
    'Case Closed',
    'My Family',
    'Another Life',
    'Hannibal',
    'Interns',
    'The Orville',
    'Never Have I Ever',
    'See',
    'The Gifted',
    'Sonic X',
    'Severance',
    'Halo',
    'Elves',
    'Constantine',
    'Nevertheless,',
    'Your Honor',
    'Full House',
    'Y: The Last Man',
    'Mayday',
    'Cosmos',
    'The Rain',
    'Jesus',
    'Sex Life',
    'It\'s Okay to Not Be Okay',
    'Charlotte',
    'Jaguar',
    'The Act',
    'Best Friends',
    'The Odyssey',
    'Maid',
    'Tehran',
    'Dickinson',
])

# Shows are part of the same 'universe', not really referencing eachother
UNIVERSES = [
    set(['Naruto', 'Naruto Shippūden']),
    set(['The Book of Boba Fett', 'The Mandalorian']),
    set(['Gotham', 'The Flash', 'Titans', 'Teen Titans', 'Arrow', 'Supergirl',
         'Superman & Lois', 'Black Lightning', 'Young Justice', 'Batman: The Brave and the Bold',
         'DC\'s Legends of Tomorrow', 'Smallville', 'Peacemaker', 'Teen Titans Go!', 'Batwoman',
         'Lois & Clark: The New Adventures of Superman', 'Harley Quinn', 'Batman: The Animated Series']),
    set(['Fear the Walking Dead', 'The Walking Dead']),
    set(['The Simpsons', 'Family Guy', 'Bob\'s Burgers']),
    set(['Ben 10', 'Ben 10: Ultimate Alien']),
    set(['NCIS', 'NCIS: Los Angeles', 'NCIS: New Orleans']),
    set(['The Big Bang Theory', 'Young Sheldon']),
    set(['Dragon Ball Super', 'Dragon Ball Absalon', 'Dragon Ball Z']),
    set(['Better Call Saul', 'Breaking Bad']),
    set(['Halo: Nightfall', 'Halo']),
    set(['Star Trek: Enterprise', 'Star Trek', 'Star Trek: Picard', 'Star Trek: The Next Generation'
         'Star Trek: The Next Generation', 'Star Trek: Discovery', 'Star Trek', 'Star Trek: Voyager',
         'Star Trek: Deep Space Nine']),
    set(['iCarly', 'Sam & Cat']),
    set(['Magnum P.I.', 'Magnum, P.I.']),
    set(['American Horror Stories', 'American Horror Story']),
    set(['Marvel\'s Avengers Assemble',
        'The Avengers: Earth\'s Mightiest Heroes', 'Heroes', 'Moon Knight']),
    set(['Star Wars: The Clone Wars', 'The Mandalorian', 'Star Wars Rebels', ]),
    set(['CSI: Vegas', 'CSI: NY']),
    set(['Sailor Moon', 'Sailor Moon Crystal']),
]