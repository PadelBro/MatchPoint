package models.tournament.external;

import lombok.Builder;
import lombok.Value;
import lombok.extern.jackson.Jacksonized;
import models.player.internal.Rating;
import models.tournament.internal.TournamentStatus;

@Value
@Builder
@Jacksonized
public class FilterTournamentsRequest {

    String city;

    TournamentStatus status;

    Long startDate;

    Long endDate;

    Rating minRating;

    Rating maxRating;

    Integer offset;

    Integer limit;
}