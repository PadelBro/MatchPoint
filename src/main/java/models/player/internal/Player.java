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
    RatingZone ratingZone;

    @NonNull
    String homeAddress;

    String playtomicProfileUrl;

    Long createdAt;

    Long updatedAt;
}

