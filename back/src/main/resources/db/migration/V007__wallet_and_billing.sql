-- Wallet (stamp money) and the DAR Plus subscription.

CREATE TABLE wallets (
    id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id       UUID        NOT NULL UNIQUE REFERENCES users (id) ON DELETE CASCADE,
    balance_minor BIGINT      NOT NULL DEFAULT 0,
    currency      CHAR(3)     NOT NULL DEFAULT 'EUR',
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT wallets_balance_check  CHECK (balance_minor >= 0),
    CONSTRAINT wallets_currency_check CHECK (currency ~ '^[A-Z]{3}$')
);

COMMENT ON COLUMN wallets.balance_minor IS 'Balance in minor units (cents). "€ 4.50" is stored as 450.';

-- wallets.updated_at is set by the application on every balance change, not
-- by a trigger (see V001).

CREATE TABLE wallet_transactions (
    id           UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    wallet_id    UUID         NOT NULL REFERENCES wallets (id) ON DELETE CASCADE,
    amount_minor BIGINT       NOT NULL,
    currency     CHAR(3)      NOT NULL,
    type         VARCHAR(30)  NOT NULL,
    status       VARCHAR(20)  NOT NULL DEFAULT 'PENDING',
    letter_id    UUID         REFERENCES letters (id) ON DELETE SET NULL,
    external_ref VARCHAR(120),
    description  VARCHAR(255),
    created_at   TIMESTAMPTZ  NOT NULL DEFAULT now(),
    settled_at   TIMESTAMPTZ,
    CONSTRAINT wallet_transactions_type_check
        CHECK (type IN ('TOP_UP', 'STAMP_PURCHASE', 'SUBSCRIPTION', 'REFUND', 'BONUS', 'ADJUSTMENT')),
    CONSTRAINT wallet_transactions_status_check
        CHECK (status IN ('PENDING', 'COMPLETED', 'FAILED', 'CANCELLED')),
    CONSTRAINT wallet_transactions_amount_check CHECK (amount_minor <> 0),
    CONSTRAINT wallet_transactions_currency_check CHECK (currency ~ '^[A-Z]{3}$')
);

COMMENT ON COLUMN wallet_transactions.amount_minor IS 'Signed: credits are positive, debits negative.';

CREATE INDEX wallet_transactions_wallet_idx ON wallet_transactions (wallet_id, created_at DESC);
CREATE UNIQUE INDEX wallet_transactions_external_ref_uk
    ON wallet_transactions (external_ref) WHERE external_ref IS NOT NULL;

CREATE TABLE subscription_plans (
    id             SMALLINT     PRIMARY KEY,
    code           VARCHAR(50)  NOT NULL UNIQUE,
    name           VARCHAR(120) NOT NULL,
    description    TEXT,
    price_minor    BIGINT       NOT NULL,
    currency       CHAR(3)      NOT NULL DEFAULT 'EUR',
    billing_period VARCHAR(20)  NOT NULL DEFAULT 'MONTHLY',
    active         BOOLEAN      NOT NULL DEFAULT TRUE,
    CONSTRAINT subscription_plans_price_check  CHECK (price_minor >= 0),
    CONSTRAINT subscription_plans_period_check CHECK (billing_period IN ('MONTHLY', 'YEARLY'))
);

CREATE TABLE subscriptions (
    id                   UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id              UUID        NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    plan_id              SMALLINT    NOT NULL REFERENCES subscription_plans (id),
    status               VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    started_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
    current_period_start TIMESTAMPTZ NOT NULL,
    current_period_end   TIMESTAMPTZ NOT NULL,
    cancelled_at         TIMESTAMPTZ,
    external_ref         VARCHAR(120),
    created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT subscriptions_status_check
        CHECK (status IN ('ACTIVE', 'PAST_DUE', 'CANCELLED', 'EXPIRED')),
    CONSTRAINT subscriptions_period_check CHECK (current_period_end > current_period_start)
);

-- A user can hold only one non-terminated subscription at a time.
CREATE UNIQUE INDEX subscriptions_active_uk
    ON subscriptions (user_id) WHERE status IN ('ACTIVE', 'PAST_DUE');

CREATE INDEX subscriptions_user_idx ON subscriptions (user_id, started_at DESC);

-- subscriptions.updated_at is set by the application on every status
-- transition, not by a trigger (see V001).
