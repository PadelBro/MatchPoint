ALTER TABLE tournament
    ADD COLUMN min_rating TEXT NOT NULL,
    ADD COLUMN max_rating TEXT NOT NULL;
ALTER TABLE tournament DROP COLUMN rating_zones;

ALTER TABLE player
    ADD COLUMN rating TEXT NOT NULL ;
ALTER TABLE player DROP COLUMN rating_zone;
