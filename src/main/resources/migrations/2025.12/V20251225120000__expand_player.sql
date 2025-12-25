ALTER TABLE player
    ADD COLUMN gender text NOT NULL DEFAULT 'male',
    ADD COLUMN hand text NOT NULL DEFAULT 'right',
    ADD COLUMN court_side text NOT NULL DEFAULT 'right';

