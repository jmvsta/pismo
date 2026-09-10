-- In-app notifications, pushed live over a WebSocket (see NotificationSocketRegistry)
-- and persisted here so a user sees what they missed while offline.

CREATE TABLE notifications (
    id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id    UUID        NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    type       VARCHAR(30) NOT NULL,
    title      VARCHAR(200) NOT NULL,
    body       TEXT,
    read_at    TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT notifications_type_check
        CHECK (type IN ('PEN_PAL_REQUEST', 'LETTER_SENT', 'LETTER_DELIVERED'))
);

CREATE INDEX notifications_user_idx ON notifications (user_id, created_at DESC);
CREATE INDEX notifications_user_unread_idx ON notifications (user_id) WHERE read_at IS NULL;
