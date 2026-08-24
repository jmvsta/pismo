-- Forum: topics, posts, threaded replies and "thanks" reactions (front/src/pages/Forum).

CREATE TABLE forum_topics (
    id          SMALLINT     PRIMARY KEY,
    code        VARCHAR(50)  NOT NULL UNIQUE,
    title       VARCHAR(120) NOT NULL,
    description TEXT,
    position    SMALLINT     NOT NULL,
    active      BOOLEAN      NOT NULL DEFAULT TRUE,
    CONSTRAINT forum_topics_position_uk UNIQUE (position)
);

CREATE TABLE forum_posts (
    id           UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    topic_id     SMALLINT     NOT NULL REFERENCES forum_topics (id),
    author_id    UUID         NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    title        VARCHAR(200) NOT NULL,
    body         TEXT         NOT NULL,
    reply_count  INTEGER      NOT NULL DEFAULT 0,
    thanks_count INTEGER      NOT NULL DEFAULT 0,
    pinned       BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at   TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at   TIMESTAMPTZ  NOT NULL DEFAULT now(),
    deleted_at   TIMESTAMPTZ,
    CONSTRAINT forum_posts_counts_check CHECK (reply_count >= 0 AND thanks_count >= 0)
);

COMMENT ON COLUMN forum_posts.reply_count IS 'Denormalised counter kept in sync by the application; the feed sorts on it.';

CREATE INDEX forum_posts_latest_idx     ON forum_posts (created_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX forum_posts_topic_idx      ON forum_posts (topic_id, created_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX forum_posts_author_idx     ON forum_posts (author_id, created_at DESC);
CREATE INDEX forum_posts_top_idx        ON forum_posts (thanks_count DESC, created_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX forum_posts_unanswered_idx ON forum_posts (created_at DESC) WHERE deleted_at IS NULL AND reply_count = 0;

CREATE TABLE forum_post_photos (
    id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id    UUID        NOT NULL REFERENCES forum_posts (id) ON DELETE CASCADE,
    url        TEXT        NOT NULL,
    caption    VARCHAR(200),
    position   SMALLINT    NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT forum_post_photos_position_uk UNIQUE (post_id, position)
);

CREATE TABLE forum_replies (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id         UUID        NOT NULL REFERENCES forum_posts (id) ON DELETE CASCADE,
    parent_reply_id UUID        REFERENCES forum_replies (id) ON DELETE CASCADE,
    author_id       UUID        NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    body            TEXT        NOT NULL,
    thanks_count    INTEGER     NOT NULL DEFAULT 0,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at      TIMESTAMPTZ,
    CONSTRAINT forum_replies_thanks_check CHECK (thanks_count >= 0)
);

CREATE INDEX forum_replies_post_idx   ON forum_replies (post_id, created_at);
CREATE INDEX forum_replies_parent_idx ON forum_replies (parent_reply_id);
CREATE INDEX forum_replies_author_idx ON forum_replies (author_id, created_at DESC);

-- forum_posts.updated_at and forum_replies.updated_at are set by the
-- application on edit, not by a trigger (see V001).

-- "Thanks" is the only reaction in the product; exactly one per user per target.
CREATE TABLE forum_post_thanks (
    post_id    UUID        NOT NULL REFERENCES forum_posts (id) ON DELETE CASCADE,
    user_id    UUID        NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (post_id, user_id)
);

CREATE INDEX forum_post_thanks_user_idx ON forum_post_thanks (user_id);

CREATE TABLE forum_reply_thanks (
    reply_id   UUID        NOT NULL REFERENCES forum_replies (id) ON DELETE CASCADE,
    user_id    UUID        NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (reply_id, user_id)
);

CREATE INDEX forum_reply_thanks_user_idx ON forum_reply_thanks (user_id);
