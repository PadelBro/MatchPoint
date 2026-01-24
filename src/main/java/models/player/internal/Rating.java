package models.player.internal;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;
import models.general.EnumClass;

import java.util.Objects;

@EnumClass
public enum Rating {
    R00("0.0"),
    R05("0.5"),
    R10("1.0"),
    R15("1.5"),
    R20("2.0"),
    R25("2.5"),
    R30("3.0"),
    R35("3.5"),
    R40("4.0"),
    R45("4.5"),
    R50("5.0"),
    R55("5.5"),
    R60("6.0"),
    R65("6.5"),
    R70("7.0");

    @JsonValue
    public final String value;

    @JsonCreator
    Rating(String value) {this.value = Objects.requireNonNull(value);}

    public static Rating fromValue(String value) {
        for (Rating zone : Rating.values()) {
            if (zone.value.equals(value)) return zone;
        }
        throw new IllegalArgumentException("Unknown Rating: " + value);
    }

    public boolean lessThanOrEqual(Rating other) {
        return this.compareTo(other) <= 0;
    }

    public boolean greaterThanOrEqual(Rating other) {
        return this.compareTo(other) >= 0;
    }

    public boolean fallsIn(Rating start, Rating end) {
        return this.greaterThanOrEqual(start) && this.lessThanOrEqual(end);
    }
}
