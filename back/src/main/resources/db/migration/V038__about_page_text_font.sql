-- Per-TEXT-block typography on the About page: font_size is the size in px at full desktop width
-- (it scales down with the canvas on narrow screens, like the default text does) and font_family
-- names one of a fixed set of font stacks the front end defines. Both null = the site's default
-- look, so every existing block stays exactly as it was.
ALTER TABLE about_page_blocks
    ADD COLUMN font_size   REAL CHECK (font_size IS NULL OR (font_size >= 8 AND font_size <= 120)),
    ADD COLUMN font_family VARCHAR(20);
