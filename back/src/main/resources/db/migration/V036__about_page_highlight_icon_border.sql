-- Three more per-element options on the About page canvases, all off/empty by default so
-- nothing existing changes: a border around a canvas, a left accent bar on a TEXT block
-- ("highlighted"), and a line icon shown before a BUTTON block's label (icon holds the
-- icon's name, e.g. 'pencil'; the front end maps names to the drawn icons).
ALTER TABLE about_page_canvases ADD COLUMN bordered    BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE about_page_blocks   ADD COLUMN highlighted BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE about_page_blocks   ADD COLUMN icon        VARCHAR(40);
