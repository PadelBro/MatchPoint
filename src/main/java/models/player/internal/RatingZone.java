package models.player.internal;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;
import models.general.EnumClass;

import java.util.Objects;

@EnumClass
public enum RatingZone {
    R00_R05("0.0-0.5"),
    R05_R10("0.5-1.0"),
    R10_15("1.0-1.5"),
    R15_R20("1.5-2.0"),
    R20_R25("2.0-2.5"),
    R25_R30("2.5-3.0"),
    R30_R35("3.0-3.5"),
    R35_R40("3.5-4.0"),
    R40_R45("4.0-4.5"),
    R45_R50("4.5-5.0"),
    R50_R55("5.0-5.5"),
    R55_R60("5.5-6.0"),
    R60_R65("6.0-6.5"),
    R65_R70("6.5-7.0");

    @JsonValue
    public final String value;

    @JsonCreator
    RatingZone(String value) {this.value = Objects.requireNonNull(value);}

    public static RatingZone fromValue(String value) {
        for (RatingZone zone : RatingZone.values()) {
            if (zone.value.equals(value)) return zone;
        }
        throw new IllegalArgumentException("Unknown RatingZone: " + value);
    }
}
