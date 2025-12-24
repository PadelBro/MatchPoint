package models.player.external;

import lombok.Builder;
import lombok.NonNull;
import lombok.Value;
import lombok.extern.jackson.Jacksonized;
import models.player.internal.RatingZone;

@Value
@Builder
@Jacksonized
public class CreatePlayerRequest {
    @NonNull
    String username;

    @NonNull
    RatingZone ratingZone;

    @NonNull
    String homeAddress;

    String playtomicProfileUrl;
}