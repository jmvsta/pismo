-- Singleton "About us" page: a light markdown-subset body (headings, bold, italic --
-- rendered client-side) plus an ordered set of photos, editable by admins only,
-- visible to everyone including signed-out visitors.

ALTER TABLE images DROP CONSTRAINT images_owner_type_check;
ALTER TABLE images ADD CONSTRAINT images_owner_type_check
    CHECK (owner_type IN ('USER_AVATAR', 'FORUM_POST_PHOTO', 'ABOUT_PAGE_PHOTO'));

CREATE TABLE about_page (
    id         SMALLINT    PRIMARY KEY DEFAULT 1,
    body       TEXT        NOT NULL DEFAULT '',
    updated_by UUID        REFERENCES users (id) ON DELETE SET NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT about_page_singleton_check CHECK (id = 1)
);

INSERT INTO about_page (id, body) VALUES (
    1,
    '# About Pismo na Dar

We''re building a deliberately old-fashioned way to make pen pals: real letters, sent by real post, between people matched by what they actually care about.'
);

CREATE TABLE about_page_photos (
    id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    image_id   UUID        NOT NULL REFERENCES images (id) ON DELETE CASCADE,
    caption    VARCHAR(200),
    position   INTEGER     NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX about_page_photos_position_idx ON about_page_photos (position);
