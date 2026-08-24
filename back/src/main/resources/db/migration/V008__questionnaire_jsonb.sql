-- Questionnaire, take two: a versioned JSONB document instead of the relational
-- tables from V002. The docs are explicit that the questionnaire is a first
-- proposal that will keep changing ("ovo je fleksibilno i menjaće se"), and with
-- three relational tables every tweak means seeding new rows, deactivating old
-- ones and keeping version bookkeeping consistent across all of them. Here a
-- revision is one INSERT of a new definition.
--
-- No environment has run V002 yet, so dropping its tables loses nothing.
--
-- THE KEY CONTRACT. Question keys are the stable identity across versions --
-- matching compares answers->>'q01_ideal_now' between two users. Rewording a
-- question keeps its key; changing what a question *means* requires a new key.
-- Break that rule and cross-version matching silently compares nonsense.
--
-- Validation is an application concern. A relational FK used to guarantee an
-- answer pointed at a real option; JSONB guarantees only that it is an object.
-- The app validates answers against the version's definition on submit. That is
-- an acceptable trade for low-stakes questionnaire data -- addresses and
-- subscriptions stay fully relational precisely because they are not low-stakes.

DROP TABLE user_answer_options;
DROP TABLE user_answers;
DROP TABLE questionnaire_options;
DROP TABLE questionnaire_questions;
DROP TABLE questionnaire_sections;

CREATE TABLE questionnaire_versions (
    id         SERIAL      PRIMARY KEY,
    kind       VARCHAR(20) NOT NULL DEFAULT 'registration',
    version    INTEGER     NOT NULL,
    definition JSONB       NOT NULL,
    is_active  BOOLEAN     NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT questionnaire_versions_kind_check
        CHECK (kind IN ('registration', 'experience')),
    CONSTRAINT questionnaire_versions_version_check CHECK (version > 0),
    CONSTRAINT questionnaire_versions_definition_check
        CHECK (jsonb_typeof(definition) = 'object'),
    -- Versions are numbered per kind: registration v1 and experience v1 coexist.
    CONSTRAINT questionnaire_versions_uk UNIQUE (kind, version)
);

COMMENT ON TABLE questionnaire_versions IS
    'One row per revision of a questionnaire; the whole form lives in "definition".';
COMMENT ON COLUMN questionnaire_versions.kind IS
    'registration = the sign-up questionnaire that drives matching; experience = the post-receipt survey sent when a letter arrives.';
COMMENT ON COLUMN questionnaire_versions.definition IS
    'Shape: {"version": 1, "sections": [{"code", "title"}], "questions": [{"key", "type": single|multi|single_or_free, "section", "text", "display"?, "max_selections"?, "options": [{"key", "text", "photo_url"?, "free_text"?}]}]}. Questions are a flat array -- "sections" only groups them for the UI, it is not part of the answer contract.';

-- Only one live questionnaire per kind at a time.
CREATE UNIQUE INDEX questionnaire_versions_active_uk
    ON questionnaire_versions (kind) WHERE is_active;

CREATE TABLE user_questionnaire_responses (
    id                       UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id                  UUID        NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    questionnaire_version_id INTEGER     NOT NULL REFERENCES questionnaire_versions (id),
    answers                  JSONB       NOT NULL DEFAULT '{}',
    submitted_at             TIMESTAMPTZ,
    created_at               TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at               TIMESTAMPTZ NOT NULL DEFAULT now(),
    -- One response per version, so history survives across revisions.
    CONSTRAINT user_questionnaire_responses_uk UNIQUE (user_id, questionnaire_version_id),
    CONSTRAINT user_questionnaire_responses_answers_check
        CHECK (jsonb_typeof(answers) = 'object')
);

COMMENT ON TABLE user_questionnaire_responses IS
    'Registration questionnaire responses. The FK is the surrogate id rather than the version number, because version numbers are only unique within a kind.';
COMMENT ON COLUMN user_questionnaire_responses.answers IS
    'Keyed by question key. Single: {"q01_ideal_now": "terrace_book_coffee"}. Multi: {"hobbies_sport": ["tennis", "swimming"]}. Free text on single_or_free: {"q05_travel_mode": {"other": "by motorbike"}}.';
COMMENT ON COLUMN user_questionnaire_responses.submitted_at IS
    'NULL while the user is mid-form; set on submit. Matching only reads submitted responses.';

CREATE INDEX user_questionnaire_responses_version_idx
    ON user_questionnaire_responses (questionnaire_version_id);

-- Matching queries are containment shaped ("everyone who picked wine over
-- beer"), which is what jsonb_path_ops is built for.
CREATE INDEX user_questionnaire_responses_answers_idx
    ON user_questionnaire_responses USING GIN (answers jsonb_path_ops);

-- updated_at is set by the application on every save, not by a trigger (see V001).

-- Cross-version matching starts with the intersection of keys present in both
-- users' versions; no key_mappings column until that actually hurts.
