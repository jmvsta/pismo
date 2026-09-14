-- Lets the frontend deep-link a notification to the profile it's about (e.g. the pen
-- pal who accepted your request), and adds the PEN_PAL_ACCEPTED type used for that case.

ALTER TABLE notifications ADD COLUMN subject_id UUID;

ALTER TABLE notifications DROP CONSTRAINT notifications_type_check;
ALTER TABLE notifications ADD CONSTRAINT notifications_type_check
    CHECK (type IN ('PEN_PAL_REQUEST', 'PEN_PAL_ACCEPTED', 'LETTER_SENT', 'LETTER_DELIVERED'));
