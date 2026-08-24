-- Questionnaire: the sectioned form that drives matching (front/src/pages/Questionnaire).

CREATE TABLE questionnaire_sections (
    id         SMALLINT     PRIMARY KEY,
    code       VARCHAR(50)  NOT NULL UNIQUE,
    title      VARCHAR(120) NOT NULL,
    position   SMALLINT     NOT NULL,
    created_at TIMESTAMPTZ  NOT NULL DEFAULT now(),
    CONSTRAINT questionnaire_sections_position_uk UNIQUE (position)
);

CREATE TABLE questionnaire_questions (
    id             SMALLINT    PRIMARY KEY,
    section_id     SMALLINT    NOT NULL REFERENCES questionnaire_sections (id),
    code           VARCHAR(50) NOT NULL UNIQUE,
    prompt         TEXT        NOT NULL,
    answer_type    VARCHAR(20) NOT NULL,
    position       SMALLINT    NOT NULL,
    required       BOOLEAN     NOT NULL DEFAULT TRUE,
    max_selections SMALLINT,
    active         BOOLEAN     NOT NULL DEFAULT TRUE,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT questionnaire_questions_type_check
        CHECK (answer_type IN ('SINGLE_CHOICE', 'MULTI_CHOICE', 'PHOTO_CHOICE', 'TEXT', 'SCALE')),
    CONSTRAINT questionnaire_questions_max_selections_check
        CHECK (max_selections IS NULL OR max_selections > 0),
    CONSTRAINT questionnaire_questions_position_uk UNIQUE (section_id, position)
);

CREATE TABLE questionnaire_options (
    id          INTEGER      PRIMARY KEY,
    question_id SMALLINT     NOT NULL REFERENCES questionnaire_questions (id) ON DELETE CASCADE,
    code        VARCHAR(60)  NOT NULL,
    label       VARCHAR(200) NOT NULL,
    photo_url   TEXT,
    position    SMALLINT     NOT NULL,
    CONSTRAINT questionnaire_options_code_uk     UNIQUE (question_id, code),
    CONSTRAINT questionnaire_options_position_uk UNIQUE (question_id, position)
);

CREATE TABLE user_answers (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID        NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    question_id SMALLINT    NOT NULL REFERENCES questionnaire_questions (id) ON DELETE CASCADE,
    text_value  TEXT,
    scale_value SMALLINT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT user_answers_uk UNIQUE (user_id, question_id),
    CONSTRAINT user_answers_scale_check CHECK (scale_value IS NULL OR scale_value BETWEEN 1 AND 10)
);

CREATE INDEX user_answers_question_id_idx ON user_answers (question_id);

-- Chosen options for choice-type answers; one row per selected option.
CREATE TABLE user_answer_options (
    answer_id UUID    NOT NULL REFERENCES user_answers (id) ON DELETE CASCADE,
    option_id INTEGER NOT NULL REFERENCES questionnaire_options (id) ON DELETE CASCADE,
    PRIMARY KEY (answer_id, option_id)
);

CREATE INDEX user_answer_options_option_id_idx ON user_answer_options (option_id);
