-- Rank badges awarded automatically as a user's count of actually-sent letters
-- (status beyond DRAFT) crosses a threshold. Separate from the manually-awarded
-- achievement badges (V006): these are computed from a configured range and
-- accumulate -- a user keeps every tier they've ever reached, not just the
-- current one.

CREATE TABLE letter_rank_badges (
    id          SMALLINT     PRIMARY KEY,
    code        VARCHAR(50)  NOT NULL UNIQUE,
    title       VARCHAR(120) NOT NULL,
    min_letters INTEGER      NOT NULL,
    max_letters INTEGER,
    icon_url    TEXT,
    position    SMALLINT     NOT NULL,
    CONSTRAINT letter_rank_badges_position_uk UNIQUE (position),
    CONSTRAINT letter_rank_badges_range_check
        CHECK (min_letters >= 0 AND (max_letters IS NULL OR max_letters >= min_letters))
);

CREATE TABLE user_letter_rank_badges (
    user_id             UUID        NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    letter_rank_badge_id SMALLINT   NOT NULL REFERENCES letter_rank_badges (id) ON DELETE CASCADE,
    awarded_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (user_id, letter_rank_badge_id)
);

CREATE INDEX user_letter_rank_badges_badge_idx ON user_letter_rank_badges (letter_rank_badge_id);

INSERT INTO letter_rank_badges (id, code, title, min_letters, max_letters, icon_url, position) VALUES
    (1, 'beginner',     'Beginner',     0,   9,    NULL, 1),
    (2, 'rising_star',  'Rising Star',  10,  29,   NULL, 2),
    (3, 'expert',       'Expert',       30,  49,   NULL, 3),
    (4, 'veteran',      'Veteran',      50,  99,   NULL, 4),
    (5, 'legend',       'Legend',       100, NULL, NULL, 5);
