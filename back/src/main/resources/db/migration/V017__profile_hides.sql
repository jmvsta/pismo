-- "Hide" on a suggested-profile card: this user never wants to see that profile
-- in their matches feed again. Distinct from a declined pen pal request -- a
-- profile can be hidden before any request ever happens.

CREATE TABLE user_profile_hides (
    user_id        UUID        NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    hidden_user_id UUID        NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    hidden_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (user_id, hidden_user_id),
    CONSTRAINT user_profile_hides_not_self_check CHECK (user_id <> hidden_user_id)
);

CREATE INDEX user_profile_hides_hidden_user_idx ON user_profile_hides (hidden_user_id);
