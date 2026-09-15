-- Lets an admin set a background image behind a canvas's freeform blocks,
-- independent of any PHOTO block placed on top of it.
ALTER TABLE about_page_canvases
    ADD COLUMN background_image_id UUID REFERENCES images (id) ON DELETE SET NULL;
