package models.user.internal;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;
import models.general.EnumClass;

import java.util.Objects;

@EnumClass
public enum UserStatus {
    ACTIVE("active"),
    SUSPENDED("suspended"),
    DELETED("deleted");

    @JsonValue
    public final String value;

    @JsonCreator
    UserStatus(String value) {this.value = Objects.requireNonNull(value);}
}
