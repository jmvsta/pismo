-- Marks whether a pen pal request came from the "Send me a letter" moderator
-- request flow, so the first-letter turn rule can tell it apart from a
-- normal pen pal request even when the addressee also happens to be a
-- moderator.

ALTER TABLE pen_pal_requests
    ADD COLUMN source VARCHAR(30) NOT NULL DEFAULT 'STANDARD';

ALTER TABLE pen_pal_requests
    ADD CONSTRAINT pen_pal_requests_source_check
        CHECK (source IN ('STANDARD', 'MODERATOR_LETTER_REQUEST'));
