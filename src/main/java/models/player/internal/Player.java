package models.player.internal;

import lombok.Builder;
import lombok.NonNull;
import lombok.Value;
import lombok.extern.jackson.Jacksonized;

import java.util.UUID;

@Value
@Builder
@Jacksonized
public class Player {

    UUID id;

    @NonNull
    String username;

    @NonNull
    Rating rating;

    @NonNull
    String homeAddress;

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

