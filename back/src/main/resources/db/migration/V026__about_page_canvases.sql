-- Split the single freeform canvas into any number of canvases, each with its own
-- resizable height (a percentage of its own width, like an aspect ratio) so admins can
-- stack multiple photo/text layouts on the About page instead of being limited to one.
CREATE TABLE about_page_canvases (
    id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    height     REAL        NOT NULL DEFAULT 56.25 CHECK (height >= 10 AND height <= 300),
    position   INTEGER     NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX about_page_canvases_position_idx ON about_page_canvases (position);

-- Carry over the existing blocks onto a single canvas so nothing disappears.
INSERT INTO about_page_canvases (id, height, position)
VALUES ('00000000-0000-0000-0000-000000000001', 56.25, 0);

ALTER TABLE about_page_blocks
    ADD COLUMN canvas_id UUID REFERENCES about_page_canvases (id) ON DELETE CASCADE;

UPDATE about_page_blocks SET canvas_id = '00000000-0000-0000-0000-000000000001';

ALTER TABLE about_page_blocks ALTER COLUMN canvas_id SET NOT NULL;

CREATE INDEX about_page_blocks_canvas_id_idx ON about_page_blocks (canvas_id);
