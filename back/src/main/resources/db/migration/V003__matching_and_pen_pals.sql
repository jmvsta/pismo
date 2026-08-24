-- Matching scores, pen pal requests and the resulting connections.

-- One row per unordered pair; user_a_id < user_b_id is enforced so a pair is stored once.
CREATE TABLE user_matches (
    user_a_id       UUID          NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    user_b_id       UUID          NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    score           NUMERIC(5, 2) NOT NULL,
    shared_interests TEXT[]       NOT NULL DEFAULT '{}',
    computed_at     TIMESTAMPTZ   NOT NULL DEFAULT now(),
    PRIMARY KEY (user_a_id, user_b_id),
    CONSTRAINT user_matches_order_check CHECK (user_a_id < user_b_id),
    CONSTRAINT user_matches_score_check CHECK (score >= 0 AND score <= 100)
);

COMMENT ON COLUMN user_matches.score IS 'Match percentage shown in the UI, e.g. 82.00 for "82% match with you".';

CREATE INDEX user_matches_user_a_score_idx ON user_matches (user_a_id, score DESC);
CREATE INDEX user_matches_user_b_score_idx ON user_matches (user_b_id, score DESC);

CREATE TABLE pen_pal_requests (
    id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    requester_id UUID        NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    addressee_id UUID        NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    status       VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    message      TEXT,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
    responded_at TIMESTAMPTZ,
    CONSTRAINT pen_pal_requests_status_check
        CHECK (status IN ('PENDING', 'ACCEPTED', 'DECLINED', 'CANCELLED')),
    CONSTRAINT pen_pal_requests_not_self_check CHECK (requester_id <> addressee_id),
    CONSTRAINT pen_pal_requests_responded_check
        CHECK ((status = 'PENDING') = (responded_at IS NULL))
);

-- At most one open request per direction.
CREATE UNIQUE INDEX pen_pal_requests_pending_uk
    ON pen_pal_requests (requester_id, addressee_id)
    WHERE status = 'PENDING';

CREATE INDEX pen_pal_requests_addressee_idx ON pen_pal_requests (addressee_id, status);

CREATE TABLE pen_pal_connections (
    id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_a_id      UUID        NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    user_b_id      UUID        NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    request_id     UUID        REFERENCES pen_pal_requests (id) ON DELETE SET NULL,
    established_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    ended_at       TIMESTAMPTZ,
    ended_by_id    UUID        REFERENCES users (id) ON DELETE SET NULL,
    CONSTRAINT pen_pal_connections_order_check CHECK (user_a_id < user_b_id),
    CONSTRAINT pen_pal_connections_pair_uk UNIQUE (user_a_id, user_b_id)
);

CREATE INDEX pen_pal_connections_user_b_idx ON pen_pal_connections (user_b_id);
CREATE INDEX pen_pal_connections_active_idx  ON pen_pal_connections (user_a_id) WHERE ended_at IS NULL;
