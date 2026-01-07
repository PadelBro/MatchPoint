package models.tournament.internal;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;
import models.general.EnumClass;

import java.util.Objects;

@EnumClass
public enum TournamentStatus {
    PENDING("pending"),
    ACTIVE("active"),
    COMPLETED("completed");


    @JsonValue
    public final String value;

    @JsonCreator
    TournamentStatus(String value) {this.value = Objects.requireNonNull(value);}
}
