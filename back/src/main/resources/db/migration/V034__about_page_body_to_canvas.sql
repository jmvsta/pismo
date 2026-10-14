-- The About page's own body text is no longer a special block above the canvases: it
-- becomes an ordinary first canvas holding one full-size TEXT block, so it can be moved,
-- layered and edited like everything else. The text (and its RU/SRB translations) is
-- copied across here; the about_page.body_* columns are left in place, unread, as a
-- backup of the original content.

-- Canvas text used to be capped at 2000 chars, which the body can exceed.
ALTER TABLE about_page_blocks
    ALTER COLUMN text_en  TYPE TEXT,
    ALTER COLUMN text_ru  TYPE TEXT,
    ALTER COLUMN text_srb TYPE TEXT;

-- Make room at the top for the new canvas (only when there is body text to carry over).
UPDATE about_page_canvases
SET position = position + 1
WHERE EXISTS (SELECT 1 FROM about_page WHERE id = 1 AND length(trim(body_en)) > 0);

-- Canvas height is a percentage of its width; size it from the text length (about one
-- line per 100 characters at the narrowest scale) so the text isn't clipped.
WITH body AS (
    SELECT body_en, body_ru, body_srb
    FROM about_page
    WHERE id = 1 AND length(trim(body_en)) > 0
),
new_canvas AS (
    INSERT INTO about_page_canvases (height, position)
    SELECT LEAST(300, GREATEST(40, 20 + GREATEST(
               length(body_en), COALESCE(length(body_ru), 0), COALESCE(length(body_srb), 0)) / 30.0)),
           0
    FROM body
    RETURNING id
)
INSERT INTO about_page_blocks (canvas_id, block_type, text_en, text_ru, text_srb, x, y, width, height, align, z_index)
SELECT new_canvas.id, 'TEXT', body.body_en, body.body_ru, body.body_srb, 0, 0, 100, 100, 'LEFT', 1
FROM new_canvas, body;
