-- Plan limits and the family package. From the docs: level 1 receives up to 5
-- letters a month, level 2 sends up to 5 and gets 5 addresses, the golden
-- family/friends package covers 4 members with 20 letters, and activity
-- rewards can raise a user's monthly numbers.

ALTER TABLE subscription_plans
    ADD COLUMN letters_send_per_month    SMALLINT NOT NULL DEFAULT 0,
    ADD COLUMN letters_receive_per_month SMALLINT NOT NULL DEFAULT 0,
    ADD COLUMN address_allowance         SMALLINT NOT NULL DEFAULT 0,
    ADD COLUMN max_members               SMALLINT NOT NULL DEFAULT 1;

ALTER TABLE subscription_plans
    ADD CONSTRAINT subscription_plans_limits_check
        CHECK (letters_send_per_month >= 0
               AND letters_receive_per_month >= 0
               AND address_allowance >= 0
               AND max_members >= 1);

COMMENT ON COLUMN subscription_plans.address_allowance IS
    'How many pen pal addresses the plan unlocks per month (5 on level 2, 20 on golden).';
COMMENT ON COLUMN subscription_plans.max_members IS
    '1 for individual plans, 4 for the golden family & friends package.';

-- Who shares a (family/friends) subscription. The owner also has a row.
CREATE TABLE subscription_members (
    subscription_id UUID        NOT NULL REFERENCES subscriptions (id) ON DELETE CASCADE,
    user_id         UUID        NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    role            VARCHAR(10) NOT NULL DEFAULT 'MEMBER',
    is_minor        BOOLEAN     NOT NULL DEFAULT FALSE,
    added_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    removed_at      TIMESTAMPTZ,
    PRIMARY KEY (subscription_id, user_id),
    CONSTRAINT subscription_members_role_check CHECK (role IN ('OWNER', 'MEMBER'))
);

COMMENT ON TABLE subscription_members IS
    'The application enforces the plan''s max_members and at most one active membership per user.';
COMMENT ON COLUMN subscription_members.is_minor IS
    'Children on the family package get the stricter rules from the docs: no address access, usernames only, no photos.';

CREATE INDEX subscription_members_user_idx
    ON subscription_members (user_id) WHERE removed_at IS NULL;

-- Per-user, per-month counters and earned bonuses. Rewards ("nagrade za
-- učešće") land here as bonus quota on top of the plan's numbers.
CREATE TABLE user_monthly_allowances (
    user_id             UUID        NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    period              DATE        NOT NULL,
    letters_sent        SMALLINT    NOT NULL DEFAULT 0,
    letters_received    SMALLINT    NOT NULL DEFAULT 0,
    addresses_unlocked  SMALLINT    NOT NULL DEFAULT 0,
    bonus_send_quota    SMALLINT    NOT NULL DEFAULT 0,
    bonus_receive_quota SMALLINT    NOT NULL DEFAULT 0,
    bonus_addresses     SMALLINT    NOT NULL DEFAULT 0,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (user_id, period),
    CONSTRAINT user_monthly_allowances_period_check
        CHECK (period = date_trunc('month', period)::date),
    CONSTRAINT user_monthly_allowances_counts_check
        CHECK (letters_sent >= 0 AND letters_received >= 0 AND addresses_unlocked >= 0
               AND bonus_send_quota >= 0 AND bonus_receive_quota >= 0
               AND bonus_addresses >= 0)
);

COMMENT ON COLUMN user_monthly_allowances.period IS
    'First day of the month, e.g. 2026-09-01 for September 2026.';
COMMENT ON TABLE user_monthly_allowances IS
    'Effective monthly limit = plan quota + bonus columns. The "most active" reward (5 sent and 5 received in a month) unlocks 5 extra addresses via bonus_addresses.';

-- updated_at is set by the application on every counter change, not by a
-- trigger (see V001).
