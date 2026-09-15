-- Adds EN/RU/SRB translations for the About page's own body text and for
-- each TEXT block on its canvases. English stays the required column
-- (renamed from the original single-language column); Russian and Serbian
-- are optional per-item overrides that the reader falls back from to
-- English when unset.

ALTER TABLE about_page RENAME COLUMN body TO body_en;
ALTER TABLE about_page ADD COLUMN body_ru TEXT;
ALTER TABLE about_page ADD COLUMN body_srb TEXT;

ALTER TABLE about_page_blocks RENAME COLUMN text TO text_en;
ALTER TABLE about_page_blocks ADD COLUMN text_ru VARCHAR(2000);
ALTER TABLE about_page_blocks ADD COLUMN text_srb VARCHAR(2000);
