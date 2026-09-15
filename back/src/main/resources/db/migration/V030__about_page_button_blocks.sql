-- Adds a BUTTON block type: a placeable, resizable, link-carrying button
-- (the "orange button" in the editor) alongside the existing TEXT/PHOTO blocks.
ALTER TABLE about_page_blocks
    ADD COLUMN link_url VARCHAR(2000);

ALTER TABLE about_page_blocks DROP CONSTRAINT about_page_blocks_block_type_check;
ALTER TABLE about_page_blocks
    ADD CONSTRAINT about_page_blocks_block_type_check
        CHECK (block_type IN ('TEXT', 'PHOTO', 'BUTTON'));

ALTER TABLE about_page_blocks DROP CONSTRAINT about_page_blocks_content_check;
ALTER TABLE about_page_blocks
    ADD CONSTRAINT about_page_blocks_content_check CHECK (
        (block_type = 'TEXT' AND text IS NOT NULL AND image_id IS NULL AND link_url IS NULL) OR
        (block_type = 'PHOTO' AND image_id IS NOT NULL AND link_url IS NULL) OR
        (block_type = 'BUTTON' AND text IS NOT NULL AND link_url IS NOT NULL AND image_id IS NULL)
    );
