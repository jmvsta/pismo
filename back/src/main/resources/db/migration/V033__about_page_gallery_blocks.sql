-- Adds a GALLERY block type to the About page canvases: a placeable, resizable block that
-- cycles through its own ordered set of photos as a slideshow, advancing every
-- slide_interval_seconds. The photos live in their own table so a block can hold any number
-- of them; deleting the block (or its canvas) cascades to the rows, and the service deletes
-- the image blobs themselves.
ALTER TABLE about_page_blocks
    ADD COLUMN slide_interval_seconds REAL
        CHECK (slide_interval_seconds IS NULL OR (slide_interval_seconds >= 1 AND slide_interval_seconds <= 120));

ALTER TABLE about_page_blocks DROP CONSTRAINT about_page_blocks_block_type_check;
ALTER TABLE about_page_blocks
    ADD CONSTRAINT about_page_blocks_block_type_check
        CHECK (block_type IN ('TEXT', 'PHOTO', 'BUTTON', 'GALLERY'));

ALTER TABLE about_page_blocks DROP CONSTRAINT about_page_blocks_content_check;
ALTER TABLE about_page_blocks
    ADD CONSTRAINT about_page_blocks_content_check CHECK (
        (block_type = 'TEXT' AND text_en IS NOT NULL AND image_id IS NULL AND link_url IS NULL) OR
        (block_type = 'PHOTO' AND image_id IS NOT NULL AND link_url IS NULL) OR
        (block_type = 'BUTTON' AND text_en IS NOT NULL AND link_url IS NOT NULL AND image_id IS NULL) OR
        (block_type = 'GALLERY' AND text_en IS NULL AND image_id IS NULL AND link_url IS NULL
            AND slide_interval_seconds IS NOT NULL)
    );

CREATE TABLE about_page_gallery_photos (
    id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    block_id   UUID        NOT NULL REFERENCES about_page_blocks (id) ON DELETE CASCADE,
    image_id   UUID        NOT NULL REFERENCES images (id) ON DELETE CASCADE,
    position   INTEGER     NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX about_page_gallery_photos_block_idx ON about_page_gallery_photos (block_id, position);
