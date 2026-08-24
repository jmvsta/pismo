-- Achievement badges shown on the profile ("First letter sent", "10 countries reached", ...).

CREATE TABLE badges (
    id          SMALLINT     PRIMARY KEY,
    code        VARCHAR(50)  NOT NULL UNIQUE,
    title       VARCHAR(120) NOT NULL,
    description TEXT,
    icon_url    TEXT,
    position    SMALLINT     NOT NULL,
    active      BOOLEAN      NOT NULL DEFAULT TRUE,
    CONSTRAINT badges_position_uk UNIQUE (position)
);

CREATE TABLE user_badges (
    user_id    UUID        NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    badge_id   SMALLINT    NOT NULL REFERENCES badges (id) ON DELETE CASCADE,
    awarded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (user_id, badge_id)
);

CREATE INDEX user_badges_badge_idx ON user_badges (badge_id);
