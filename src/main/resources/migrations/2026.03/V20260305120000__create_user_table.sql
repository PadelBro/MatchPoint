CREATE TABLE app_user (
    id                   UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name           VARCHAR(100)  NOT NULL,
    last_name            VARCHAR(100)  NOT NULL,
    email                VARCHAR(255)  NOT NULL UNIQUE,
    password_hash        VARCHAR(255)  NOT NULL,
    phone_number         VARCHAR(20),
    date_of_birth        DATE,
    city                 VARCHAR(100),
    country              CHAR(2),
    profile_picture_url  VARCHAR(500),
    playtomic_profile_url VARCHAR(500),
    status               VARCHAR(20)   NOT NULL DEFAULT 'active',
    created_at           BIGINT        DEFAULT EXTRACT(EPOCH FROM NOW())::BIGINT * 1000,
    updated_at           BIGINT        DEFAULT EXTRACT(EPOCH FROM NOW())::BIGINT * 1000
);