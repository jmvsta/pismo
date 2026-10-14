-- Lets admins switch rounded corners on or off for each canvas and each block on it.
-- Off by default, which keeps every existing element looking exactly as it did.
ALTER TABLE about_page_canvases ADD COLUMN rounded BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE about_page_blocks   ADD COLUMN rounded BOOLEAN NOT NULL DEFAULT FALSE;
