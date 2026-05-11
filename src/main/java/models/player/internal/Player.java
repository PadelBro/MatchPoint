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
    UUID userId;

    @NonNull
    Rating rating;

    @NonNull
    Gender gender;

    @NonNull
    Side hand;

    @NonNull
    Side courtSide;

    String racketUrl;

    String racketName;

    Long createdAt;

    Long updatedAt;
}