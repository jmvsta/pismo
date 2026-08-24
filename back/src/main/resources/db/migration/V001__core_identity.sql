-- Core identity: accounts, linked OAuth providers, shared audit plumbing.

CREATE OR REPLACE FUNCTION set_updated_at() RETURNS trigger AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TABLE users (
    id                UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    nickname          VARCHAR(50)  NOT NULL,
    email             VARCHAR(320) NOT NULL,
    password_hash     VARCHAR(100),
    date_of_birth     DATE,
    avatar_url        TEXT,
    bio               TEXT,
    city              VARCHAR(120),
    country_code      CHAR(2),
    role              VARCHAR(20)  NOT NULL DEFAULT 'USER',
    status            VARCHAR(20)  NOT NULL DEFAULT 'ACTIVE',
    rules_accepted_at TIMESTAMPTZ  NOT NULL,
    email_verified_at TIMESTAMPTZ,
    last_seen_at      TIMESTAMPTZ,
    created_at        TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at        TIMESTAMPTZ  NOT NULL DEFAULT now(),
    deleted_at        TIMESTAMPTZ,
    CONSTRAINT users_role_check   CHECK (role IN ('USER', 'MODERATOR', 'ADMIN')),
    CONSTRAINT users_status_check CHECK (status IN ('ACTIVE', 'SUSPENDED', 'DELETED')),
    CONSTRAINT users_nickname_len_check CHECK (char_length(btrim(nickname)) >= 3),
    CONSTRAINT users_country_code_check CHECK (country_code ~ '^[A-Z]{2}$')
);

COMMENT ON COLUMN users.password_hash IS 'NULL for accounts that only sign in through an OAuth provider.';

-- Case-insensitive uniqueness without depending on the citext extension.
CREATE UNIQUE INDEX users_nickname_lower_uk ON users (lower(nickname));
CREATE UNIQUE INDEX users_email_lower_uk    ON users (lower(email));

CREATE TRIGGER users_set_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE user_oauth_accounts (
    id               UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id          UUID         NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    provider         VARCHAR(20)  NOT NULL,
    provider_user_id VARCHAR(255) NOT NULL,
    email            VARCHAR(320),
    linked_at        TIMESTAMPTZ  NOT NULL DEFAULT now(),
    CONSTRAINT user_oauth_provider_check CHECK (provider IN ('GOOGLE', 'APPLE')),
    CONSTRAINT user_oauth_provider_uk UNIQUE (provider, provider_user_id)
);

CREATE INDEX user_oauth_accounts_user_id_idx ON user_oauth_accounts (user_id);
