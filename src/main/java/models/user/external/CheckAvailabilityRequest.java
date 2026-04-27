package models.user.external;

import lombok.Builder;
import lombok.NonNull;
import lombok.Value;
import lombok.extern.jackson.Jacksonized;

@Value
@Builder
@Jacksonized
public class CheckAvailabilityRequest {

    @NonNull
    String email;

    String phoneNumber;

    String country;
}