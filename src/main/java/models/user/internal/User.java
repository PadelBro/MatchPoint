package models.user.internal;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.NonNull;
import lombok.Value;
import lombok.extern.jackson.Jacksonized;

import java.time.LocalDate;
import java.util.UUID;

@Value
@Builder
@Jacksonized
public class User {

    UUID id;

    @NonNull
    String firstName;

    @NonNull
    String lastName;

    @NonNull
    String email;

    @NonNull
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    String passwordHash;

    String phoneNumber;

    LocalDate dateOfBirth;

    String city;

    String country;

    String profilePictureUrl;

    String playtomicProfileUrl;

    @NonNull
    UserStatus status;

    Long createdAt;

    Long updatedAt;
}