CREATE TABLE IF NOT EXISTS player (
                                      id uuid PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
                                      username text NOT NULL,
                                      rating_zone text NOT NULL,
                                      home_address text NOT NULL,
                                      playtomic_profile_url text,
                                      created_at bigint NOT NULL DEFAULT extract(epoch from now()) * 1000,
                                      updated_at bigint NOT NULL DEFAULT extract(epoch from now()) * 1000
);
