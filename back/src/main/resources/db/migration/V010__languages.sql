-- Letter languages. The docs promise letters in Serbian, English and Russian
-- from day one, with Chinese and German pencilled in with question marks —
-- those two ship inactive. Language preferences feed matching, and learners of
-- Serbian get letters with a language-practice section.

CREATE TABLE languages (
    code        VARCHAR(10) PRIMARY KEY,
    name        VARCHAR(80) NOT NULL,
    native_name VARCHAR(80) NOT NULL,
    position    SMALLINT    NOT NULL,
    active      BOOLEAN     NOT NULL DEFAULT TRUE,
    CONSTRAINT languages_position_uk UNIQUE (position)
);

INSERT INTO languages (code, name, native_name, position, active) VALUES
    ('sr', 'Serbian', 'srpski',   1, TRUE),
    ('en', 'English', 'English',  2, TRUE),
    ('ru', 'Russian', 'русский',  3, TRUE),
    ('de', 'German',  'Deutsch',  4, FALSE),
    ('zh', 'Chinese', '中文',      5, FALSE);

CREATE TABLE user_languages (
    user_id       UUID        NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    language_code VARCHAR(10) NOT NULL REFERENCES languages (code),
    purpose       VARCHAR(10) NOT NULL,
    proficiency   VARCHAR(15),
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (user_id, language_code, purpose),
    CONSTRAINT user_languages_purpose_check
        CHECK (purpose IN ('WRITE', 'RECEIVE', 'LEARNING')),
    CONSTRAINT user_languages_proficiency_check
        CHECK (proficiency IS NULL
               OR proficiency IN ('BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'NATIVE'))
);

COMMENT ON TABLE user_languages IS
    'WRITE = can write letters in it, RECEIVE = wants letters in it, LEARNING = studying it (a LEARNING row in Serbian unlocks the language-practice letter section).';

CREATE INDEX user_languages_language_idx ON user_languages (language_code, purpose);

-- Which language a given letter is (to be) written in.
ALTER TABLE letters
    ADD COLUMN language_code VARCHAR(10) REFERENCES languages (code);

COMMENT ON COLUMN letters.language_code IS
    'NULL for old rows and drafts where it is not chosen yet.';
