package models.tournament.internal;

import lombok.Builder;
import lombok.NonNull;
import lombok.Value;
import lombok.extern.jackson.Jacksonized;
import models.player.internal.Rating;

import java.util.List;
import java.util.UUID;

@Value
@Builder
@Jacksonized
public class Tournament {

    UUID id;

    @NonNull
    String name;

    String description;

    @NonNull
    String city;

    String prizes;

    @NonNull
    Long startDate;

    @NonNull
    Long endDate;

    @NonNull
    List<UUID> organizerIds;

    @NonNull
    TournamentStatus status;

    @NonNull
    Rating minRating;

    @NonNull
    Rating maxRating;

    Long createdAt;

    Long updatedAt;

}

