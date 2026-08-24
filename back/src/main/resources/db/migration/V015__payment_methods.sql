-- Stripe integration: stored payment methods, and the Stripe identifiers needed to
-- actually charge/cancel through Stripe rather than just flipping local status.

ALTER TABLE wallets
    ADD COLUMN stripe_customer_id VARCHAR(255);

CREATE UNIQUE INDEX wallets_stripe_customer_id_uk
    ON wallets (stripe_customer_id) WHERE stripe_customer_id IS NOT NULL;

ALTER TABLE subscriptions
    ADD COLUMN stripe_subscription_id VARCHAR(255),
    ADD COLUMN auto_renew BOOLEAN NOT NULL DEFAULT TRUE;

CREATE UNIQUE INDEX subscriptions_stripe_subscription_id_uk
    ON subscriptions (stripe_subscription_id) WHERE stripe_subscription_id IS NOT NULL;

CREATE TABLE payment_methods (
    id                       UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id                  UUID         NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    stripe_payment_method_id VARCHAR(255) NOT NULL UNIQUE,
    brand                    VARCHAR(30),
    last4                    CHAR(4),
    exp_month                SMALLINT,
    exp_year                 SMALLINT,
    is_default               BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at               TIMESTAMPTZ  NOT NULL DEFAULT now(),
    removed_at               TIMESTAMPTZ,
    CONSTRAINT payment_methods_exp_month_check CHECK (exp_month IS NULL OR exp_month BETWEEN 1 AND 12)
);

COMMENT ON TABLE payment_methods IS
    'Only Stripe PaymentMethod references and display metadata (brand/last4/expiry) -- raw card numbers never touch this database.';

CREATE INDEX payment_methods_user_idx ON payment_methods (user_id) WHERE removed_at IS NULL;

CREATE UNIQUE INDEX payment_methods_default_uk
    ON payment_methods (user_id) WHERE is_default AND removed_at IS NULL;

-- payment_methods has no updated_at: rows are either inserted once or soft-removed,
-- never edited in place (see V001 for the no-trigger policy).
