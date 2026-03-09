ALTER TABLE player
    ADD COLUMN user_id UUID REFERENCES app_user(id),
    DROP COLUMN username,
    DROP COLUMN home_address,
    DROP COLUMN playtomic_profile_url;
