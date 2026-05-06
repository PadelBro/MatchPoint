package com.matchPoint.services

import com.matchPoint.helpers.JwtService
import com.matchPoint.repositories.UserRepository
import models.user.external.{CheckAvailabilityRequest, CreateUserRequest, UpdateUserRequest}
import models.user.internal.{User, UserStatus}
import org.mockito.ArgumentMatchers.any
import org.mockito.Mockito
import org.mockito.Mockito.when
import org.scalatest.BeforeAndAfterEach
import org.scalatest.concurrent.ScalaFutures
import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers
import org.springframework.dao.DuplicateKeyException

import java.time.LocalDate
import java.util.UUID
import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future

class UserServiceSpec extends AnyFlatSpec with Matchers with ScalaFutures with BeforeAndAfterEach {

  private val repo    = Mockito.mock(classOf[UserRepository])
  private val jwt     = Mockito.mock(classOf[JwtService])
  private val service = new UserService(repo, jwt)

  override def beforeEach(): Unit = Mockito.reset(repo, jwt)

  private def validRequest(
    firstName: String  = "John",
    lastName:  String  = "Doe",
    email:     String  = "john@example.com",
    password:  String  = "secret123",
    dob:       LocalDate = null,
    city:      String  = null,
    country:   String  = null,
    phone:     String  = null,
    profilePic: String = null,
    playtomic:  String = null,
  ) =
    CreateUserRequest.builder()
      .firstName(firstName)
      .lastName(lastName)
      .email(email)
      .password(password)
      .dateOfBirth(dob)
      .city(city)
      .country(country)
      .phoneNumber(phone)
      .profilePictureUrl(profilePic)
      .playtomicProfileUrl(playtomic)
      .build()

  private def user() =
    User.builder()
      .id(UUID.randomUUID())
      .firstName("John")
      .lastName("Doe")
      .email("john@example.com")
      .passwordHash("$2a$10$hashed")
      .status(UserStatus.ACTIVE)
      .build()

  // ── createUser ───────────────────────────────────────────────────────────────

  "createUser" should "delegate to repo and return the created user" in {
    val u = user()
    when(repo.insert(any())).thenReturn(Future.successful(u))
    service.createUser(validRequest()).futureValue shouldBe u
  }

  it should "fail with 'Email already in use' on DuplicateKeyException" in {
    when(repo.insert(any())).thenReturn(Future.failed(new DuplicateKeyException("dup")))
    service.createUser(validRequest()).failed.futureValue.getMessage should include("Email already in use")
  }

  // ── validate: email ──────────────────────────────────────────────────────────

  "createUser" should "throw synchronously for an invalid email" in {
    intercept[IllegalArgumentException] {
      service.createUser(validRequest(email = "not-an-email"))
    }.getMessage should include("Invalid email")
  }

  // ── validate: name length ────────────────────────────────────────────────────

  it should "throw synchronously when first name exceeds 100 characters" in {
    intercept[IllegalArgumentException] {
      service.createUser(validRequest(firstName = "A" * 101))
    }.getMessage should include("First name")
  }

  it should "throw synchronously when last name exceeds 100 characters" in {
    intercept[IllegalArgumentException] {
      service.createUser(validRequest(lastName = "B" * 101))
    }.getMessage should include("Last name")
  }

  // ── validate: date of birth ──────────────────────────────────────────────────

  it should "throw synchronously when date of birth is in the future" in {
    intercept[IllegalArgumentException] {
      service.createUser(validRequest(dob = LocalDate.now().plusDays(1)))
    }.getMessage should include("Date of birth")
  }

  it should "accept today as a valid date of birth" in {
    val u = user()
    when(repo.insert(any())).thenReturn(Future.successful(u))
    service.createUser(validRequest(dob = LocalDate.now())).futureValue shouldBe u
  }

  // ── validate: city ───────────────────────────────────────────────────────────

  it should "throw synchronously when city exceeds 100 characters" in {
    intercept[IllegalArgumentException] {
      service.createUser(validRequest(city = "C" * 101))
    }.getMessage should include("City")
  }

  // ── validate: country ────────────────────────────────────────────────────────

  it should "throw synchronously for an invalid ISO country code" in {
    intercept[IllegalArgumentException] {
      service.createUser(validRequest(country = "XX"))
    }.getMessage should include("Invalid country code")
  }

  it should "accept a valid ISO country code" in {
    val u = user()
    when(repo.insert(any())).thenReturn(Future.successful(u))
    service.createUser(validRequest(country = "NL")).futureValue shouldBe u
  }

  // ── validate: profile picture URL ───────────────────────────────────────────

  it should "throw synchronously when profile picture URL is not on cloudinary.com" in {
    intercept[IllegalArgumentException] {
      service.createUser(validRequest(profilePic = "https://evil.com/pic.jpg"))
    }.getMessage should include("cloudinary.com")
  }

  it should "accept a valid cloudinary profile picture URL" in {
    val u = user()
    when(repo.insert(any())).thenReturn(Future.successful(u))
    service.createUser(validRequest(profilePic = "https://res.cloudinary.com/demo/image/upload/sample.jpg"))
      .futureValue shouldBe u
  }

  // ── validate: playtomic URL ──────────────────────────────────────────────────

  it should "throw synchronously when Playtomic URL is not on playtomic.com" in {
    intercept[IllegalArgumentException] {
      service.createUser(validRequest(playtomic = "https://evil.com/player/123"))
    }.getMessage should include("playtomic.com")
  }

  it should "accept a valid playtomic.com URL" in {
    val u = user()
    when(repo.insert(any())).thenReturn(Future.successful(u))
    service.createUser(validRequest(playtomic = "https://playtomic.com/player/123"))
      .futureValue shouldBe u
  }

  // ── validate: phone number ───────────────────────────────────────────────────

  it should "throw synchronously for an invalid phone number" in {
    intercept[IllegalArgumentException] {
      service.createUser(validRequest(phone = "not-a-phone"))
    }.getMessage should include("phone number")
  }

  it should "accept a valid E.164 phone number" in {
    val u = user()
    when(repo.insert(any())).thenReturn(Future.successful(u))
    service.createUser(validRequest(phone = "+31612345678")).futureValue shouldBe u
  }

  // ── checkAvailability ────────────────────────────────────────────────────────

  "checkAvailability" should "succeed when email is not taken and no phone is provided" in {
    when(repo.getByEmail("john@example.com")).thenReturn(Future.successful(None))
    service.checkAvailability(
      CheckAvailabilityRequest.builder().email("john@example.com").build()
    ).futureValue shouldBe ()
  }

  it should "succeed when email is not taken and phone is not taken" in {
    when(repo.getByEmail("john@example.com")).thenReturn(Future.successful(None))
    when(repo.getByPhone("+31612345678")).thenReturn(Future.successful(None))
    service.checkAvailability(
      CheckAvailabilityRequest.builder()
        .email("john@example.com")
        .phoneNumber("+31612345678")
        .build()
    ).futureValue shouldBe ()
  }

  it should "fail with 'Email already in use' when email is taken" in {
    when(repo.getByEmail("taken@example.com")).thenReturn(Future.successful(Some(user())))
    service.checkAvailability(
      CheckAvailabilityRequest.builder().email("taken@example.com").build()
    ).failed.futureValue.getMessage should include("Email already in use")
  }

  it should "fail with 'Phone number already in use' when phone is taken" in {
    when(repo.getByEmail("john@example.com")).thenReturn(Future.successful(None))
    when(repo.getByPhone("+31612345678")).thenReturn(Future.successful(Some(user())))
    service.checkAvailability(
      CheckAvailabilityRequest.builder()
        .email("john@example.com")
        .phoneNumber("+31612345678")
        .build()
    ).failed.futureValue.getMessage should include("Phone number already in use")
  }

  it should "fail with 'Invalid phone number' for a malformed phone" in {
    when(repo.getByEmail("john@example.com")).thenReturn(Future.successful(None))
    service.checkAvailability(
      CheckAvailabilityRequest.builder()
        .email("john@example.com")
        .phoneNumber("not-a-phone")
        .build()
    ).failed.futureValue.getMessage should include("Invalid phone number")
  }

  // ── updateUser ───────────────────────────────────────────────────────────────

  private def validUpdateRequest(
    firstName:          String    = "John",
    lastName:           String    = "Doe",
    email:              String    = "john@example.com",
    phone:              String    = null,
    dob:                LocalDate = null,
    city:               String    = null,
    country:            String    = null,
    playtomicProfileUrl: String   = null,
  ) =
    UpdateUserRequest.builder()
      .firstName(firstName)
      .lastName(lastName)
      .email(email)
      .phoneNumber(phone)
      .dateOfBirth(dob)
      .city(city)
      .country(country)
      .playtomicProfileUrl(playtomicProfileUrl)
      .build()

  "updateUser" should "update the user when no fields change" in {
    val id = UUID.randomUUID()
    val existing = User.builder()
      .id(id).firstName("John").lastName("Doe").email("john@example.com")
      .passwordHash("$2a$10$hashed").status(UserStatus.ACTIVE).build()
    val updated = existing
    when(repo.getById(id)).thenReturn(Future.successful(Some(existing)))
    when(repo.update(any())).thenReturn(Future.successful(updated))
    service.updateUser(id, validUpdateRequest()).futureValue shouldBe updated
  }

  it should "allow email change when new email is not taken" in {
    val id = UUID.randomUUID()
    val existing = User.builder()
      .id(id).firstName("John").lastName("Doe").email("old@example.com")
      .passwordHash("$2a$10$hashed").status(UserStatus.ACTIVE).build()
    val updatedUser = User.builder()
      .id(id).firstName("John").lastName("Doe").email("new@example.com")
      .passwordHash("$2a$10$hashed").status(UserStatus.ACTIVE).build()
    when(repo.getById(id)).thenReturn(Future.successful(Some(existing)))
    when(repo.getByEmail("new@example.com")).thenReturn(Future.successful(None))
    when(repo.update(any())).thenReturn(Future.successful(updatedUser))
    service.updateUser(id, validUpdateRequest(email = "new@example.com")).futureValue shouldBe updatedUser
  }

  it should "fail with 'Email already in use' when new email is taken" in {
    val id = UUID.randomUUID()
    val existing = User.builder()
      .id(id).firstName("John").lastName("Doe").email("old@example.com")
      .passwordHash("$2a$10$hashed").status(UserStatus.ACTIVE).build()
    when(repo.getById(id)).thenReturn(Future.successful(Some(existing)))
    when(repo.getByEmail("taken@example.com")).thenReturn(Future.successful(Some(user())))
    service.updateUser(id, validUpdateRequest(email = "taken@example.com"))
      .failed.futureValue.getMessage should include("Email already in use")
  }

  it should "allow phone change when new phone is not taken" in {
    val id = UUID.randomUUID()
    val existing = User.builder()
      .id(id).firstName("John").lastName("Doe").email("john@example.com")
      .passwordHash("$2a$10$hashed").phoneNumber("+31600000000").status(UserStatus.ACTIVE).build()
    val updatedUser = User.builder()
      .id(id).firstName("John").lastName("Doe").email("john@example.com")
      .passwordHash("$2a$10$hashed").phoneNumber("+31612345678").status(UserStatus.ACTIVE).build()
    when(repo.getById(id)).thenReturn(Future.successful(Some(existing)))
    when(repo.getByPhone("+31612345678")).thenReturn(Future.successful(None))
    when(repo.update(any())).thenReturn(Future.successful(updatedUser))
    service.updateUser(id, validUpdateRequest(phone = "+31612345678")).futureValue shouldBe updatedUser
  }

  it should "fail with 'Phone number already in use' when new phone is taken" in {
    val id = UUID.randomUUID()
    val existing = User.builder()
      .id(id).firstName("John").lastName("Doe").email("john@example.com")
      .passwordHash("$2a$10$hashed").status(UserStatus.ACTIVE).build()
    when(repo.getById(id)).thenReturn(Future.successful(Some(existing)))
    when(repo.getByPhone("+31612345678")).thenReturn(Future.successful(Some(user())))
    service.updateUser(id, validUpdateRequest(phone = "+31612345678"))
      .failed.futureValue.getMessage should include("Phone number already in use")
  }

  it should "fail with 'User not found' when user does not exist" in {
    val id = UUID.randomUUID()
    when(repo.getById(id)).thenReturn(Future.successful(None))
    service.updateUser(id, validUpdateRequest())
      .failed.futureValue.getMessage should include("User not found")
  }

  it should "throw synchronously for an invalid email" in {
    val id = UUID.randomUUID()
    intercept[IllegalArgumentException] {
      service.updateUser(id, validUpdateRequest(email = "not-an-email"))
    }.getMessage should include("Invalid email")
  }

  it should "throw synchronously when first name is blank" in {
    val id = UUID.randomUUID()
    intercept[IllegalArgumentException] {
      service.updateUser(id, validUpdateRequest(firstName = "  "))
    }.getMessage should include("First name")
  }

  it should "throw synchronously when date of birth is in the future" in {
    val id = UUID.randomUUID()
    intercept[IllegalArgumentException] {
      service.updateUser(id, validUpdateRequest(dob = LocalDate.now().plusDays(1)))
    }.getMessage should include("Date of birth")
  }

  it should "fail with 'Email already in use' on DuplicateKeyException from repo" in {
    val id = UUID.randomUUID()
    val existing = User.builder()
      .id(id).firstName("John").lastName("Doe").email("john@example.com")
      .passwordHash("$2a$10$hashed").status(UserStatus.ACTIVE).build()
    when(repo.getById(id)).thenReturn(Future.successful(Some(existing)))
    when(repo.update(any())).thenReturn(Future.failed(new DuplicateKeyException("dup")))
    service.updateUser(id, validUpdateRequest())
      .failed.futureValue.getMessage should include("Email already in use")
  }

  // ── getUser ───────────────────────────────────────────────────────────────────

  "getUser" should "return Some when the user exists" in {
    val id = UUID.randomUUID()
    val u  = user()
    when(repo.getById(id)).thenReturn(Future.successful(Some(u)))
    service.getUser(id).futureValue shouldBe Some(u)
  }

  it should "return None when the user does not exist" in {
    val id = UUID.randomUUID()
    when(repo.getById(id)).thenReturn(Future.successful(None))
    service.getUser(id).futureValue shouldBe None
  }
}