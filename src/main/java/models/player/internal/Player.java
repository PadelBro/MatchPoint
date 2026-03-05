package models.player.internal;

import lombok.Builder;
import lombok.NonNull;
import lombok.Value;
import lombok.extern.jackson.Jacksonized;

import java.time.LocalDate;
import java.util.UUID;

@Value
@Builder
@Jacksonized
public class Player {

    UUID id;

    @NonNull
    Rating rating;

    @NonNull
    Gender gender;

    @NonNull
    Side hand;

    @NonNull
    Side courtSide;

    String playtomicProfileUrl;

    Long createdAt;

    Long updatedAt;
}

