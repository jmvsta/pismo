-- Verification code sent at registration and re-issuable via resendVerificationCode;
-- email_verified_at (already on users since V001) is set once the code is confirmed.

ALTER TABLE users
    ADD COLUMN email_verification_code             VARCHAR(6),
    ADD COLUMN email_verification_code_expires_at  TIMESTAMPTZ;

-- Grandfather in every account that existed before this feature shipped, so enforcing
-- verification doesn't lock out users who registered when there was nothing to confirm.
UPDATE users SET email_verified_at = created_at WHERE email_verified_at IS NULL;
