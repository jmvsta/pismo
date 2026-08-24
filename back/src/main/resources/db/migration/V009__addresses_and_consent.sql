-- Postal addresses and address-sharing consent. The docs insist on privacy:
-- addresses are confidential, never shown to other users, and only revealed
-- inside a pen pal connection when the owner explicitly allows it. Without
-- consent, letters are relayed through the team ("pisma šaljete meni, a ja ih
-- prosleđujem na adresu korisnika").

CREATE TABLE user_addresses (
    id             UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id        UUID         NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    recipient_name VARCHAR(160) NOT NULL,
    street_line1   VARCHAR(200) NOT NULL,
    street_line2   VARCHAR(200),
    city           VARCHAR(120) NOT NULL,
    region         VARCHAR(120),
    postal_code    VARCHAR(20),
    country_code   CHAR(2)      NOT NULL,
    is_primary     BOOLEAN      NOT NULL DEFAULT FALSE,
    verified_at    TIMESTAMPTZ,
    created_at     TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at     TIMESTAMPTZ  NOT NULL DEFAULT now(),
    deleted_at     TIMESTAMPTZ,
    CONSTRAINT user_addresses_country_code_check CHECK (country_code ~ '^[A-Z]{2}$'),
    CONSTRAINT user_addresses_recipient_name_check
        CHECK (char_length(btrim(recipient_name)) >= 2)
);

COMMENT ON TABLE user_addresses IS
    'Confidential. Only ever exposed to another user through an active connection_address_consents grant; profiles show nicknames, never addresses.';
COMMENT ON COLUMN user_addresses.recipient_name IS
    'The name written on the envelope — the one place a real name is stored, since profiles deliberately carry only nicknames.';

CREATE INDEX user_addresses_user_idx ON user_addresses (user_id) WHERE deleted_at IS NULL;

CREATE UNIQUE INDEX user_addresses_primary_uk
    ON user_addresses (user_id) WHERE is_primary AND deleted_at IS NULL;

-- updated_at is set by the application on every edit, not by a trigger (see V001).

CREATE TABLE connection_address_consents (
    id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    connection_id UUID        NOT NULL REFERENCES pen_pal_connections (id) ON DELETE CASCADE,
    grantor_id    UUID        NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    address_id    UUID        REFERENCES user_addresses (id) ON DELETE SET NULL,
    status        VARCHAR(10) NOT NULL DEFAULT 'GRANTED',
    granted_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    revoked_at    TIMESTAMPTZ,
    CONSTRAINT connection_address_consents_status_check
        CHECK (status IN ('GRANTED', 'REVOKED')),
    CONSTRAINT connection_address_consents_revoked_check
        CHECK ((status = 'GRANTED') = (revoked_at IS NULL)),
    CONSTRAINT connection_address_consents_uk UNIQUE (connection_id, grantor_id)
);

COMMENT ON TABLE connection_address_consents IS
    'One row per user per connection: has this user shared their address with the other side? No row (or REVOKED) means letters to them go through the team relay. The application must ensure grantor_id is one of the two users on the connection.';
COMMENT ON COLUMN connection_address_consents.address_id IS
    'Which of the grantor''s addresses was shared; NULL after that address is deleted, which the application treats as consent needing renewal.';

CREATE INDEX connection_address_consents_grantor_idx
    ON connection_address_consents (grantor_id);
