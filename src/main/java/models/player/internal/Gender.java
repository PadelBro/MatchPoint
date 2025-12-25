package models.player.internal;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;
import models.general.EnumClass;

import java.util.Objects;

@EnumClass
public enum Gender {
    MALE("male"),
    FEMALE("female");

    @JsonValue
    public final String value;

    @JsonCreator
    Gender(String value) {this.value = Objects.requireNonNull(value);}
}
