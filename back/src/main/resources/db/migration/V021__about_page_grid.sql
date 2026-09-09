-- Fixed 3x3 layout grid for the "About us" page: admins can place a short text or a
-- photo in any cell, positioned directly on the page (the free-form positioning called
-- out as "complex stuff" is still deferred; this is the grid-based first iteration).
-- A cell only has a row here while it holds content -- an unclaimed cell renders empty.
CREATE TABLE about_page_grid_cells (
    id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    row_index  SMALLINT    NOT NULL,
    col_index  SMALLINT    NOT NULL,
    cell_type  VARCHAR(10) NOT NULL CHECK (cell_type IN ('TEXT', 'PHOTO')),
    text       VARCHAR(500),
    image_id   UUID        REFERENCES images (id) ON DELETE CASCADE,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT about_page_grid_cells_position_unique UNIQUE (row_index, col_index),
    CONSTRAINT about_page_grid_cells_content_check CHECK (
        (cell_type = 'TEXT' AND text IS NOT NULL AND image_id IS NULL) OR
        (cell_type = 'PHOTO' AND image_id IS NOT NULL AND text IS NULL)
    )
);
