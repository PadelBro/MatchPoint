CREATE TABLE IF NOT EXISTS tournament
(
    id            uuid PRIMARY KEY NOT NULL,
    name          text             NOT NULL,
    description   text,
    city          text             NOT NULL,
    prizes        text,
    start_date    bigint           NOT NULL,
    end_date      bigint           NOT NULL,
    status        text             NOT NULL,
    organizer_ids jsonb            NOT NULL,
    rating_zones  jsonb            NOT NULL,
    created_at    bigint           NOT NULL DEFAULT extract(epoch from now()) * 1000,
    updated_at    bigint           NOT NULL DEFAULT extract(epoch from now()) * 1000
);
