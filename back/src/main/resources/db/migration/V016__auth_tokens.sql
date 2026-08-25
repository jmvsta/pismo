-- Bearer-token auth: a random token issued on register/login, checked per request
-- against auth_token/auth_token_expires_at instead of a server-side session.
-- oauth_token is reserved for a future, simpler Google OAuth wiring -- unused for now.

ALTER TABLE users
    ADD COLUMN auth_token             VARCHAR(255) UNIQUE,
    ADD COLUMN auth_token_expires_at  TIMESTAMPTZ,
    ADD COLUMN oauth_token            VARCHAR(255);

CREATE INDEX users_auth_token_idx ON users (auth_token) WHERE auth_token IS NOT NULL;
