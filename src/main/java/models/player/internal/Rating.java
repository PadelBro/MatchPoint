package models.player.internal;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;
import models.general.EnumClass;

@EnumClass
public enum Rating {
    R00(0.0f),
    R05(0.5f),
    R10(1.0f),
    R15(1.5f),
    R20(2.0f),
    R25(2.5f),
    R30(3.0f),
    R35(3.5f),
    R40(4.0f),
    R45(4.5f),
    R50(5.0f),
    R55(5.5f),
    R60(6.0f),
    R65(6.5f),
    R70(7.0f);

    @JsonValue
    public final float value;

    Rating(float value) {
        this.value = value;
    }

    @JsonCreator
    public static Rating fromJson(double value) {
        float f = (float) value;
        for (Rating r : Rating.values()) {
            if (r.value == f) return r;
        }
        throw new IllegalArgumentException("Unknown Rating: " + value);
    }

    public static Rating fromValue(String value) {
        return fromJson(Double.parseDouble(value));
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
