-- Replace the fixed photo gallery and the 3x3 grid with a single freeform canvas: each
-- block (text or photo) carries its own drag-to-place position (x, y) and resizable
-- footprint (width, height), all expressed as percentages of the canvas, plus an
-- alignment. This is what "complex stuff" in the original task meant -- the grid was an
-- intermediate step, and having both a grid and a plain gallery turned out to just be
-- two hard-to-tell-apart places a photo could live.
CREATE TABLE about_page_blocks (
    id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    block_type VARCHAR(10) NOT NULL CHECK (block_type IN ('TEXT', 'PHOTO')),
    text       VARCHAR(2000),
    image_id   UUID        REFERENCES images (id) ON DELETE CASCADE,
    x          REAL        NOT NULL DEFAULT 0 CHECK (x >= 0 AND x <= 100),
    y          REAL        NOT NULL DEFAULT 0 CHECK (y >= 0 AND y <= 100),
    width      REAL        NOT NULL DEFAULT 30 CHECK (width > 0 AND width <= 100),
    height     REAL        NOT NULL DEFAULT 20 CHECK (height > 0 AND height <= 100),
    align      VARCHAR(6)  NOT NULL DEFAULT 'LEFT' CHECK (align IN ('LEFT', 'CENTER', 'RIGHT')),
    z_index    INTEGER     NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT about_page_blocks_content_check CHECK (
        (block_type = 'TEXT' AND text IS NOT NULL AND image_id IS NULL) OR
        (block_type = 'PHOTO' AND image_id IS NOT NULL)
    )
);

-- Best-effort carry over of whatever admins already placed in the grid/gallery, laid out
-- on the same 3x3 footprint the grid used so nothing just disappears.
INSERT INTO about_page_blocks (block_type, text, image_id, x, y, width, height, align, z_index)
SELECT cell_type, text, image_id, col_index * 33.34, row_index * 33.34, 33.33, 33.33, 'LEFT',
       row_index * 3 + col_index
FROM about_page_grid_cells;

INSERT INTO about_page_blocks (block_type, text, image_id, x, y, width, height, align, z_index)
SELECT 'PHOTO', NULL, image_id, (position % 3) * 33.34, (position / 3) * 33.34, 33.33, 33.33, 'LEFT',
       100 + position
FROM about_page_photos;

DROP TABLE about_page_grid_cells;
DROP TABLE about_page_photos;
