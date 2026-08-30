-- Generic binary image storage backing user avatars and forum post photos
-- (front/src/pages/Profile, front/src/pages/Forum). Kept off the hot
-- users/forum_post_photos tables; those tables reference an image by id and
-- ImageController streams the bytes back at GET /images/{id}.

CREATE TABLE images (
    id         UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_type VARCHAR(20)  NOT NULL,
    owner_id   UUID         NOT NULL,
    mime_type  VARCHAR(100) NOT NULL,
    data       BYTEA        NOT NULL,
    created_at TIMESTAMPTZ  NOT NULL DEFAULT now(),
    CONSTRAINT images_owner_type_check CHECK (owner_type IN ('USER_AVATAR', 'FORUM_POST_PHOTO'))
);

CREATE INDEX images_owner_idx ON images (owner_type, owner_id);

-- avatar_url never had an upload path behind it -- replacing it outright
-- rather than migrating any data.
ALTER TABLE users ADD COLUMN avatar_image_id UUID REFERENCES images (id) ON DELETE SET NULL;
ALTER TABLE users DROP COLUMN avatar_url;

-- forum_post_photos.url was likewise never populated by any code path.
ALTER TABLE forum_post_photos ADD COLUMN image_id UUID NOT NULL REFERENCES images (id) ON DELETE CASCADE;
ALTER TABLE forum_post_photos DROP COLUMN url;
