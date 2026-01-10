package models.player.external;

import lombok.Builder;
import lombok.NonNull;
import lombok.Value;
import lombok.extern.jackson.Jacksonized;
import models.player.internal.Gender;
import models.player.internal.Rating;
import models.player.internal.Side;

import java.util.UUID;

@Value
@Builder
@Jacksonized
public class UpsertPlayerRequest {

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
}