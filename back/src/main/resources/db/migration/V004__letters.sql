-- Physical letters exchanged between connected pen pals, plus their delivery trail.

CREATE TABLE letters (
    id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    connection_id UUID        NOT NULL REFERENCES pen_pal_connections (id) ON DELETE CASCADE,
    sender_id     UUID        NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    recipient_id  UUID        NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    status        VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
    tracking_code VARCHAR(64),
    note          TEXT,
    sent_at       TIMESTAMPTZ,
    delivered_at  TIMESTAMPTZ,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT letters_status_check
        CHECK (status IN ('DRAFT', 'SENT', 'IN_TRANSIT', 'DELIVERED', 'LOST')),
    CONSTRAINT letters_not_self_check CHECK (sender_id <> recipient_id),
    CONSTRAINT letters_delivered_check
        CHECK (status <> 'DELIVERED' OR delivered_at IS NOT NULL)
);

COMMENT ON TABLE letters IS 'Metadata only — the letter itself travels by post, its contents are never stored.';

CREATE INDEX letters_sender_idx       ON letters (sender_id, created_at DESC);
CREATE INDEX letters_recipient_idx    ON letters (recipient_id, created_at DESC);
CREATE INDEX letters_connection_idx   ON letters (connection_id, created_at DESC);
CREATE UNIQUE INDEX letters_tracking_code_uk ON letters (tracking_code) WHERE tracking_code IS NOT NULL;

-- letters.updated_at is set by the application on every status transition,
-- not by a trigger (see V001).

CREATE TABLE letter_status_events (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    letter_id   UUID        NOT NULL REFERENCES letters (id) ON DELETE CASCADE,
    status      VARCHAR(20) NOT NULL,
    location    VARCHAR(200),
    note        TEXT,
    occurred_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT letter_status_events_status_check
        CHECK (status IN ('DRAFT', 'SENT', 'IN_TRANSIT', 'DELIVERED', 'LOST'))
);

CREATE INDEX letter_status_events_letter_idx ON letter_status_events (letter_id, occurred_at DESC);
