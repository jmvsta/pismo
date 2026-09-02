-- Photo attachments on forum replies, mirroring forum_post_photos (V005, V018).

ALTER TABLE images DROP CONSTRAINT images_owner_type_check;
ALTER TABLE images ADD CONSTRAINT images_owner_type_check
    CHECK (owner_type IN ('USER_AVATAR', 'FORUM_POST_PHOTO', 'FORUM_REPLY_PHOTO'));

CREATE TABLE forum_reply_photos (
    id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    reply_id   UUID        NOT NULL REFERENCES forum_replies (id) ON DELETE CASCADE,
    image_id   UUID        NOT NULL REFERENCES images (id) ON DELETE CASCADE,
    caption    VARCHAR(200),
    position   SMALLINT    NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT forum_reply_photos_position_uk UNIQUE (reply_id, position)
);

CREATE INDEX forum_reply_photos_reply_idx ON forum_reply_photos (reply_id);
