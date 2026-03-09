package models.user.external;

import lombok.Builder;
import lombok.NonNull;
import lombok.Value;
import lombok.extern.jackson.Jacksonized;

import java.time.LocalDate;

@Value
@Builder
@Jacksonized
public class CreateUserRequest {

    @NonNull
    String firstName;

    @NonNull
    String lastName;

    @NonNull
    String email;

    @NonNull
    String password;

    String phoneNumber;

    LocalDate dateOfBirth;

    String city;

    String country;

    String profilePictureUrl;

    String playtomicProfileUrl;
}