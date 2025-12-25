package models.player.internal;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;
import models.general.EnumClass;

import java.util.Objects;

@EnumClass
public enum Side {
    LEFT("left"),
    RIGHT("right");

    @JsonValue
    public final String value;

    @JsonCreator
    Side(String value) {this.value = Objects.requireNonNull(value);}
}
