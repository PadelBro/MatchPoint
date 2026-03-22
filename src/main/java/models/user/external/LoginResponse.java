package models.user.external;

import lombok.Builder;
import lombok.NonNull;
import lombok.Value;
import lombok.extern.jackson.Jacksonized;

import java.util.UUID;

@Value
@Builder
@Jacksonized
public class LoginResponse {

    @NonNull
    String token;

    @NonNull
    UUID id;

    @NonNull
    String firstName;

    @NonNull
    String lastName;

    @NonNull
    String email;
}