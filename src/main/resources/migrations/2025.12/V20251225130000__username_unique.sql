ALTER TABLE player
    ADD CONSTRAINT uq_players_username UNIQUE (username);
