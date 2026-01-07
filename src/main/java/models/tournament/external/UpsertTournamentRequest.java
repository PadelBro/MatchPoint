package models.tournament.external;

import lombok.Builder;
import lombok.NonNull;
import lombok.Value;
import lombok.extern.jackson.Jacksonized;
import models.tournament.internal.TournamentStatus;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Value
@Builder
@Jacksonized
public class UpsertTournamentRequest {

    UUID id;

    @NonNull
    String name;

    String description;

    @NonNull
    String city;

    String prizes;

    @NonNull
    Instant startDate;

    @NonNull
    Instant endDate;

    @NonNull
    List<UUID> organizerIds;

    @NonNull
    TournamentStatus status;

    @NonNull
    List<String> ratingZones;
}
