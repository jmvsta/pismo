-- Reference data from the project docs: the three tiers, the forum sections
-- and the achievement badges. Prices are placeholders until pricing is decided.

INSERT INTO subscription_plans
    (id, code, name, description, price_minor, currency, billing_period, active,
     letters_send_per_month, letters_receive_per_month, address_allowance, max_members)
VALUES
    (1, 'LETTER_AS_A_GIFT', 'Letter as a Gift',
     'The free level: receive handwritten letters, join the forum, play the quizzes and the Švrakopis game. Up to 5 letters a month, more through activity rewards.',
     0, 'EUR', 'MONTHLY', TRUE, 0, 5, 0, 1),
    (2, 'PEN_PAL', 'Pen Pal',
     'Send letters yourself: 5 letters and 5 matched addresses a month, chosen by shared interests from the questionnaire. Placeholder price.',
     500, 'EUR', 'MONTHLY', TRUE, 5, 5, 5, 1),
    (3, 'GOLDEN_FAMILY', 'Golden Family & Friends',
     'One year for up to 4 family members or friends: 20 letters a month in the language of your choice. Children join with usernames only. Placeholder price.',
     4900, 'EUR', 'YEARLY', TRUE, 20, 20, 20, 4);

INSERT INTO forum_topics (id, code, title, description, position, active) VALUES
    (1, 'LETTER_EXPERIENCES', 'Letter experiences',
     'Share the letter that made your day, your first reply, the stamp that travelled furthest.', 1, TRUE),
    (2, 'LEARNING_SERBIAN', 'What I learned learning Serbian',
     'Sentences, words and discoveries from letters in Serbian — practice in the comments.', 2, TRUE),
    (3, 'SVRAKOPIS', 'Švrakopis — guess the hand',
     'We post a snippet of handwriting; you guess who wrote it. The wittiest guesses win a prize.', 3, TRUE),
    (4, 'GAMES', 'Quizzes & scratch cards',
     'Scratch a lovely word, answer questions about famous pen pals of history.', 4, TRUE),
    (5, 'HOBBY_CORNER', 'Hobby corner',
     'Show your knitting, crochet, embroidery, woodcarving — the more old-fashioned, the better.', 5, TRUE),
    (6, 'HOW_WE_MET', 'How we met',
     'Stories of pen pals who became friends. Published stories get a small gift from the team.', 6, TRUE);

INSERT INTO badges (id, code, title, description, icon_url, position, active) VALUES
    (1, 'FOUNDING_PEN_PAL', 'Founding pen pal',
     'Exchanged letters with Lela during the first summer — carries a free month of Pen Pal.', NULL, 1, TRUE),
    (2, 'FIRST_LETTER_SENT', 'First letter sent',
     'Dropped a first envelope in the mailbox.', NULL, 2, TRUE),
    (3, 'FIRST_LETTER_RECEIVED', 'First letter received',
     'The postman rang for the first time.', NULL, 3, TRUE),
    (4, 'MOST_ACTIVE', 'Most active writer',
     'Sent and received five letters in a single month — unlocks five extra addresses.', NULL, 4, TRUE),
    (5, 'TEN_COUNTRIES', '10 countries reached',
     'Letters delivered to ten different countries.', NULL, 5, TRUE),
    (6, 'SVRAKOPIS_WINNER', 'Švrakopis winner',
     'Best guess in the handwriting game — a free month of Pen Pal.', NULL, 6, TRUE),
    (7, 'STORY_WINNER', 'Short story winner',
     'Won the monthly short-story contest — a free month of Golden.', NULL, 7, TRUE),
    (8, 'POLYGLOT', 'Polyglot',
     'Wrote letters in three different languages.', NULL, 8, TRUE);
