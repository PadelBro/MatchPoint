package com.matchPoint.services

import com.matchPoint.repositories.UserRepository
import models.user.external.CreateUserRequest
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
  private val service = new UserService(repo)

  override def beforeEach(): Unit = Mockito.reset(repo)

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