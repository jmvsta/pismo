-- Registration questionnaire v1, from the project doc "Registracija i upitnik":
-- 25 questions, a picture choice, nine this-or-that pairs and four hobby groups
-- (hobbies are just multi-select sections of the same form, not their own
-- tables). Text is English; the keys are the stable cross-version contract and
-- stay language-neutral, so a translated version reuses them verbatim.
--
-- Questions are one flat array. "sections" carries titles and order for the UI
-- only -- the matching algorithm reads answers by key and never looks at them.
-- photo_url is NULL until the pictures are chosen.

INSERT INTO questionnaire_versions (kind, version, is_active, definition)
VALUES ('registration', 1, TRUE, $json$
{
  "version": 1,
  "sections": [
    {"code": "right_now",       "title": "Right now"},
    {"code": "pastimes",        "title": "Pastimes"},
    {"code": "views",           "title": "Views"},
    {"code": "food_and_travel", "title": "Food & travel"},
    {"code": "character",       "title": "Character"},
    {"code": "picture",         "title": "Pick a picture"},
    {"code": "this_or_that",    "title": "This or that"},
    {"code": "hobbies",         "title": "Hobbies"}
  ],
  "questions": [
    {
      "key": "q01_ideal_now",
      "type": "single",
      "section": "right_now",
      "text": "If you could choose, right now you would be:",
      "options": [
        {"key": "terrace_book_coffee", "text": "On the terrace, reading a book and drinking coffee"},
        {"key": "hiking_active", "text": "Hiking, or on some other active holiday"},
        {"key": "asleep_minecraft", "text": "Asleep — I played Minecraft all night"}
      ]
    },
    {
      "key": "q02_cinema",
      "type": "single",
      "section": "right_now",
      "text": "At the cinema, you are:",
      "options": [
        {"key": "popcorn_comedy", "text": "Eating popcorn and watching a comedy with friends"},
        {"key": "favourite_directors", "text": "A rare guest — I only go for my favourite directors"},
        {"key": "no_films", "text": "Never there — I don't like films"}
      ]
    },
    {
      "key": "q03_music",
      "type": "single",
      "section": "right_now",
      "text": "Music is:",
      "options": [
        {"key": "rock_blues_country", "text": "Rock'n'roll, blues, country — anything but electronic without a voice and a human touch"},
        {"key": "noise_silence", "text": "Noise — silence is better"},
        {"key": "daily_mood", "text": "Every day, depending on my mood"}
      ]
    },
    {
      "key": "q04_travel_destination",
      "type": "single",
      "section": "right_now",
      "text": "I travel:",
      "options": [
        {"key": "far_countries", "text": "To faraway countries — I want to learn something new"},
        {"key": "big_cities", "text": "To big cities — I want to visit the museums"},
        {"key": "seaside_nature", "text": "To the seaside — I want to be in nature"},
        {"key": "no_travel", "text": "I don't travel — travelling is exhausting"}
      ]
    },
    {
      "key": "q05_travel_mode",
      "type": "single_or_free",
      "section": "right_now",
      "text": "I get there:",
      "options": [
        {"key": "train", "text": "By train — I want to talk to people, and I can hop off anywhere"},
        {"key": "plane", "text": "By plane — I hate the travelling part"},
        {"key": "own_car", "text": "In my own car"},
        {"key": "other", "text": "Some other way", "free_text": true}
      ]
    },
    {
      "key": "q06_sport",
      "type": "single",
      "section": "pastimes",
      "text": "Sport:",
      "options": [
        {"key": "tennis", "text": "Tennis"},
        {"key": "football", "text": "Football"},
        {"key": "martial_arts", "text": "Martial arts — anything but MMA"},
        {"key": "tv_only", "text": "Only on TV, and only if I must"}
      ]
    },
    {
      "key": "q07_film",
      "type": "single",
      "section": "pastimes",
      "text": "Film:",
      "options": [
        {"key": "series_instead", "text": "No thanks — series are more interesting"},
        {"key": "bw_classics", "text": "Black-and-white — the classics are the best"},
        {"key": "weekend_cinema", "text": "Only at the weekend, at the cinema"}
      ]
    },
    {
      "key": "q08_hobby",
      "type": "single",
      "section": "pastimes",
      "text": "A hobby is:",
      "options": [
        {"key": "waste_of_time", "text": "A waste of time"},
        {"key": "great_love", "text": "My great love"},
        {"key": "gym_or_dance", "text": "The gym, or dancing"},
        {"key": "learning_new", "text": "Learning something new"}
      ]
    },
    {
      "key": "q09_pet",
      "type": "single",
      "section": "pastimes",
      "text": "A pet:",
      "options": [
        {"key": "dog", "text": "A dog, without question"},
        {"key": "cat", "text": "A cat — I can travel without feeling guilty"},
        {"key": "too_much_work", "text": "Too much responsibility"}
      ]
    },
    {
      "key": "q10_reading",
      "type": "single",
      "section": "pastimes",
      "text": "Reading:",
      "options": [
        {"key": "world_of_books", "text": "Is there a world without books?"},
        {"key": "ebooks_only", "text": "E-books only"},
        {"key": "video_games", "text": "Video games instead"}
      ]
    },
    {
      "key": "q11_friends",
      "type": "single",
      "section": "pastimes",
      "text": "Friends:",
      "options": [
        {"key": "coffee_walk_food", "text": "Coffee, a walk, the river, good food"},
        {"key": "video_calls", "text": "Video calls — nobody lives in my city"},
        {"key": "no_time_wish_i_did", "text": "Work leaves me no time, so I don't know what's happening in their lives — and I wish I did"},
        {"key": "bowling_concert", "text": "Bowling, or a concert"}
      ]
    },
    {
      "key": "q12_work",
      "type": "single",
      "section": "pastimes",
      "text": "Work:",
      "options": [
        {"key": "necessary_evil", "text": "A necessary evil"},
        {"key": "ambitious_best", "text": "I'm ambitious and I want to be the best"},
        {"key": "love_my_work", "text": "I do what I love"},
        {"key": "pays_for_travel", "text": "How else would I pay for my travels?"}
      ]
    },
    {
      "key": "q13_best_time_of_day",
      "type": "single",
      "section": "pastimes",
      "text": "I function best:",
      "options": [
        {"key": "morning_person", "text": "In the morning — I'm a morning person"},
        {"key": "night_owl", "text": "At night — a night owl, video games"}
      ]
    },
    {
      "key": "q14_morning",
      "type": "single",
      "section": "pastimes",
      "text": "A morning is:",
      "options": [
        {"key": "bed_till_noon", "text": "In bed until noon"},
        {"key": "early_walk", "text": "An early-morning walk"},
        {"key": "book_by_river", "text": "A book by the river, or on the terrace"},
        {"key": "coffee_at_neighbours", "text": "Coffee at the neighbour's"}
      ]
    },
    {
      "key": "q15_politics",
      "type": "single",
      "section": "views",
      "text": "Politics:",
      "options": [
        {"key": "far_away", "text": "As far away from me as possible"},
        {"key": "necessary_evil", "text": "A necessary evil"},
        {"key": "best_topic", "text": "The best topic there is"}
      ]
    },
    {
      "key": "q16_religion",
      "type": "single",
      "section": "views",
      "text": "Religion:",
      "options": [
        {"key": "argument_starter", "text": "A reason for arguments among friends"},
        {"key": "tool_of_control", "text": "A tool of control"},
        {"key": "respect_and_practice", "text": "I respect all religions, and I go to church regularly"},
        {"key": "private_matter", "text": "I never talk about it — faith is a private matter"}
      ]
    },
    {
      "key": "q17_social_networks",
      "type": "single",
      "section": "views",
      "text": "Social networks:",
      "options": [
        {"key": "nobody_listens", "text": "A place where people don't listen to each other and you can only talk about yourself"},
        {"key": "find_friends", "text": "A place where I can find friends"},
        {"key": "not_a_member", "text": "I'm not on any of them"}
      ]
    },
    {
      "key": "q18_cheese",
      "type": "single",
      "section": "food_and_travel",
      "text": "Cheese:",
      "options": [
        {"key": "bacon_instead", "text": "Not a chance — pass the bacon"},
        {"key": "italy_france", "text": "Italy or France, the lands of dreams"},
        {"key": "food_is_cheese", "text": "Is there food without cheese?"}
      ]
    },
    {
      "key": "q19_breakfast",
      "type": "single",
      "section": "food_and_travel",
      "text": "Breakfast:",
      "options": [
        {"key": "whats_that", "text": "What's that?"},
        {"key": "essential", "text": "How could anyone live without it?"},
        {"key": "eggs_sausage", "text": "Scrambled eggs and sausage"},
        {"key": "muesli", "text": "Muesli"},
        {"key": "fruit", "text": "Fruit"},
        {"key": "bread_butter_cheese", "text": "Bread, butter, cheese and vegetables"}
      ]
    },
    {
      "key": "q20_dream_journey",
      "type": "single",
      "section": "food_and_travel",
      "text": "The journey of my dreams:",
      "options": [
        {"key": "mediterranean", "text": "Italy, France, Spain, Portugal — wine, food and music"},
        {"key": "spiritual_journey", "text": "Nepal or India, a spiritual journey"},
        {"key": "great_cities", "text": "One great city at a time — New York or London, Tokyo or Hong Kong"},
        {"key": "nature_anywhere", "text": "Nature, anywhere at all"}
      ]
    },
    {
      "key": "q21_coffee_or_tea",
      "type": "single",
      "section": "food_and_travel",
      "text": "Coffee or tea:",
      "options": [
        {"key": "anything_cheerful", "text": "Whatever you're pouring, as long as it's cheerful"},
        {"key": "tea_at_home", "text": "Tea at home"},
        {"key": "beer_football", "text": "Beer and football with the crew"},
        {"key": "coffee_and_book", "text": "Coffee and a book"}
      ]
    },
    {
      "key": "q22_conversation",
      "type": "single",
      "section": "character",
      "text": "In conversation, I talk:",
      "options": [
        {"key": "mostly_listen", "text": "Rarely — I listen to my friends and smile; they pause only to breathe"},
        {"key": "non_stop", "text": "Non-stop, though sometimes I pause to hear someone else's opinion"},
        {"key": "prefer_letters", "text": "I'd rather stay in — receive a letter and answer slowly, without being interrupted"}
      ]
    },
    {
      "key": "q23_social_platform",
      "type": "single",
      "section": "character",
      "text": "Pick one:",
      "options": [
        {"key": "facebook", "text": "Facebook"},
        {"key": "instagram", "text": "Instagram"},
        {"key": "tiktok", "text": "TikTok"},
        {"key": "unavailable", "text": "Unavailable"}
      ]
    },
    {
      "key": "q24_video_game",
      "type": "single",
      "section": "character",
      "text": "Pick one:",
      "options": [
        {"key": "minecraft", "text": "Minecraft"},
        {"key": "roblox", "text": "Roblox"},
        {"key": "pacman", "text": "Pac-Man"}
      ]
    },
    {
      "key": "q25_handcraft",
      "type": "single",
      "section": "character",
      "text": "If I were good with my hands, I would choose:",
      "options": [
        {"key": "knitting", "text": "Knitting"},
        {"key": "embroidery", "text": "Embroidery"},
        {"key": "two_left_hands", "text": "No chance — I have two left hands"},
        {"key": "woodcarving", "text": "Woodcarving"},
        {"key": "carpet_weaving", "text": "Carpet weaving"},
        {"key": "garden_in_nature", "text": "I'd keep my own garden and live in nature"}
      ]
    },
    {
      "key": "pick_lifestyle_photo",
      "type": "single",
      "section": "picture",
      "display": "photo",
      "text": "Choose the picture you like best:",
      "options": [
        {"key": "social_games", "text": "Bowling, billiards, beer and company — maybe a match at the weekend, tennis or the gym during the week", "photo_url": null},
        {"key": "calm_mornings", "text": "Yoga, a morning coffee and a walk with the dog before work, weekend cinema or a good meal somewhere new", "photo_url": null},
        {"key": "adrenaline_weekends", "text": "Hiking, kayaking or paragliding — every weekend used to the fullest", "photo_url": null},
        {"key": "nomad_waters", "text": "Sailing, kitesurfing or diving — I can work anywhere, anytime", "photo_url": null}
      ]
    },
    {
      "key": "tt01_superhero", "type": "single", "section": "this_or_that", "text": "Circle one:",
      "options": [{"key": "superman", "text": "Superman"}, {"key": "iron_man", "text": "Iron Man"}]
    },
    {
      "key": "tt02_novel", "type": "single", "section": "this_or_that", "text": "Circle one:",
      "options": [{"key": "romeo_juliet", "text": "Romeo and Juliet"}, {"key": "tom_sawyer", "text": "The Adventures of Tom Sawyer"}]
    },
    {
      "key": "tt03_comic", "type": "single", "section": "this_or_that", "text": "Circle one:",
      "options": [{"key": "dogman", "text": "Dog Man"}, {"key": "alan_ford", "text": "Alan Ford"}]
    },
    {
      "key": "tt04_tarzan", "type": "single", "section": "this_or_that", "text": "Circle one:",
      "options": [{"key": "tarzan_books", "text": "The Tarzan books"}, {"key": "tarzan_film", "text": "A Tarzan film"}]
    },
    {
      "key": "tt05_book_or_show", "type": "single", "section": "this_or_that", "text": "Circle one:",
      "options": [{"key": "steppenwolf", "text": "Steppenwolf"}, {"key": "kpop_demon_hunters", "text": "K-pop Demon Hunters"}]
    },
    {
      "key": "tt06_drink", "type": "single", "section": "this_or_that", "text": "Circle one:",
      "options": [{"key": "beer", "text": "Beer"}, {"key": "wine", "text": "Wine"}, {"key": "water", "text": "Water"}]
    },
    {
      "key": "tt07_snack", "type": "single", "section": "this_or_that", "text": "Circle one:",
      "options": [{"key": "cheese", "text": "Cheese"}, {"key": "sausage", "text": "Sausage"}, {"key": "chocolate", "text": "Chocolate"}]
    },
    {
      "key": "tt08_spirit", "type": "single", "section": "this_or_that", "text": "Circle one:",
      "options": [{"key": "rakija", "text": "Rakija"}, {"key": "whisky", "text": "Whisky"}, {"key": "mocktail", "text": "A non-alcoholic cocktail"}]
    },
    {
      "key": "tt09_birds", "type": "single", "section": "this_or_that", "text": "Circle one:",
      "options": [{"key": "birdwatching", "text": "Birdwatching"}, {"key": "the_birds", "text": "The horror film \"The Birds\""}]
    },
    {
      "key": "hobbies_sport",
      "type": "multi",
      "section": "hobbies",
      "text": "Sport — choose any:",
      "options": [
        {"key": "tennis", "text": "Tennis"},
        {"key": "table_tennis", "text": "Table tennis"},
        {"key": "baseball", "text": "Baseball"},
        {"key": "hockey", "text": "Hockey"},
        {"key": "football", "text": "Football"},
        {"key": "swimming", "text": "Swimming"},
        {"key": "cycling", "text": "Cycling"},
        {"key": "diving", "text": "Diving"},
        {"key": "ice_skating", "text": "Ice skating"},
        {"key": "horse_riding", "text": "Horse riding"}
      ]
    },
    {
      "key": "hobbies_film",
      "type": "multi",
      "section": "hobbies",
      "text": "Film — choose any:",
      "options": [
        {"key": "comedy", "text": "Comedy"},
        {"key": "action", "text": "Action"},
        {"key": "horror", "text": "Horror"},
        {"key": "fantasy", "text": "Fantasy"},
        {"key": "childrens", "text": "Children's"},
        {"key": "drama", "text": "Drama"},
        {"key": "thriller", "text": "Thriller"},
        {"key": "crime", "text": "Crime"},
        {"key": "musical", "text": "Musical"},
        {"key": "animated", "text": "Animated"},
        {"key": "science_fiction", "text": "Science fiction"},
        {"key": "documentary", "text": "Documentary"}
      ]
    },
    {
      "key": "hobbies_art",
      "type": "multi",
      "section": "hobbies",
      "text": "Art — choose any:",
      "options": [
        {"key": "painting", "text": "Painting"},
        {"key": "sculpture", "text": "Sculpture"},
        {"key": "writing", "text": "Writing"},
        {"key": "photography", "text": "Photography"},
        {"key": "acting", "text": "Acting"},
        {"key": "music", "text": "Music"},
        {"key": "weaving", "text": "Weaving"}
      ]
    },
    {
      "key": "hobbies_free_time",
      "type": "multi",
      "section": "hobbies",
      "text": "Free time — choose any:",
      "options": [
        {"key": "fishing", "text": "Fishing"},
        {"key": "letter_writing", "text": "Writing letters"},
        {"key": "knitting", "text": "Knitting"},
        {"key": "reading", "text": "Reading"},
        {"key": "listening_to_music", "text": "Listening to music"},
        {"key": "film", "text": "Film"},
        {"key": "walking", "text": "Walking"},
        {"key": "cycling", "text": "Cycling"},
        {"key": "hiking", "text": "Hiking"},
        {"key": "bowling", "text": "Bowling"},
        {"key": "other_sport", "text": "Basketball, or another sport"}
      ]
    }
  ]
}
$json$::jsonb);
