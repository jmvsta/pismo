-- A pair of users could only ever have ONE pen_pal_connections row (UNIQUE (user_a_id, user_b_id)),
-- but ending a connection only stamps ended_at -- the row stays. The rest of the app treats an
-- ended connection as "not connected" and lets the pair reach out again, so when they then
-- accepted, the second INSERT hit the constraint, the accept transaction rolled back with an
-- INTERNAL_ERROR, and both requests stayed stuck as pending.
--
-- What actually has to be unique is the ACTIVE connection per pair. A reconnection gets a fresh
-- row (and its own letters thread); the ended one keeps its history.
ALTER TABLE pen_pal_connections DROP CONSTRAINT pen_pal_connections_pair_uk;

CREATE UNIQUE INDEX pen_pal_connections_active_pair_uk
    ON pen_pal_connections (user_a_id, user_b_id)
    WHERE ended_at IS NULL;
