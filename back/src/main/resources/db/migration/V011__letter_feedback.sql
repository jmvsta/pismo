-- Feedback on received letters. Per the docs: when a letter arrives, the
-- recipient gets a short questionnaire about the experience — they rate the
-- quality of the letter and the person who sent it, building "a base of
-- reliable users". The team then publishes the nicest impressions, or not
-- ("mi ćemo objaviti (ili ne)").

-- The two scores stay real columns: they are aggregated into a sender's
-- reliability rating and sorted on. The rest of the survey is JSONB against a
-- questionnaire_versions row of kind 'experience', because that survey will
-- mutate exactly as much as the registration one.

CREATE TABLE letter_feedback (
    id                       UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    letter_id                UUID        NOT NULL UNIQUE REFERENCES letters (id) ON DELETE CASCADE,
    rater_id                 UUID        NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    letter_score             SMALLINT    NOT NULL,
    sender_score             SMALLINT,
    comment                  TEXT,
    questionnaire_version_id INTEGER     REFERENCES questionnaire_versions (id),
    experience_survey        JSONB       NOT NULL DEFAULT '{}',
    is_published             BOOLEAN     NOT NULL DEFAULT FALSE,
    created_at               TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at               TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT letter_feedback_letter_score_check CHECK (letter_score BETWEEN 1 AND 5),
    CONSTRAINT letter_feedback_sender_score_check
        CHECK (sender_score IS NULL OR sender_score BETWEEN 1 AND 5),
    CONSTRAINT letter_feedback_survey_check
        CHECK (jsonb_typeof(experience_survey) = 'object'),
    -- An answered survey must say which version it answered.
    CONSTRAINT letter_feedback_survey_version_check
        CHECK (experience_survey = '{}' OR questionnaire_version_id IS NOT NULL)
);

COMMENT ON COLUMN letter_feedback.experience_survey IS
    'Answers to the post-receipt survey, same key contract as user_questionnaire_responses.answers.';

COMMENT ON TABLE letter_feedback IS
    'One rating per letter, left by its recipient (the application must ensure rater_id = letters.recipient_id and the letter is DELIVERED). A user''s reliability score is aggregated from sender_score at read time.';
COMMENT ON COLUMN letter_feedback.is_published IS
    'TRUE once the team decides to feature this impression publicly; the comment stays private otherwise.';

CREATE INDEX letter_feedback_rater_idx ON letter_feedback (rater_id, created_at DESC);
CREATE INDEX letter_feedback_published_idx
    ON letter_feedback (created_at DESC) WHERE is_published;

-- updated_at is set by the application on every edit, not by a trigger (see V001).
