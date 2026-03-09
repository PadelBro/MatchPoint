package com.matchPoint.services

import com.google.i18n.phonenumbers.PhoneNumberUtil
import com.google.i18n.phonenumbers.PhoneNumberUtil.PhoneNumberFormat
import com.matchPoint.repositories.UserRepository
import models.user.external.CreateUserRequest
import models.user.internal.{User, UserStatus}
import org.apache.commons.validator.routines.EmailValidator
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.dao.DuplicateKeyException
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder
import org.springframework.stereotype.Service

import java.net.URL
import java.text.Normalizer
import java.time.LocalDate
import java.util.{Locale, UUID}
import scala.concurrent.{ExecutionContext, Future}

@Service
@Autowired
class UserService(userRepo: UserRepository)(implicit ec: ExecutionContext) {

  private val logger    = LoggerFactory.getLogger(getClass)
  private val bcrypt    = new BCryptPasswordEncoder()
  private val phoneUtil = PhoneNumberUtil.getInstance()

  private def trimOpt(s: String): Option[String] = Option(s).map(_.trim).filter(_.nonEmpty)

  def createUser(request: CreateUserRequest): Future[User] = {
    logger.info("user_create_attempt email={}", request.getEmail.trim.toLowerCase)
    validate(request)
    val user = buildFromRequest(request)
    userRepo.insert(user).map { created =>
      logger.info("user_created id={} email={}", created.getId, created.getEmail)
      created
    }.recoverWith {
      case _: DuplicateKeyException =>
        logger.warn("user_create_failed reason=EMAIL_TAKEN email={}", request.getEmail.trim.toLowerCase)
        Future.failed(new IllegalArgumentException("Email already in use"))
      case ex =>
        logger.error("user_create_failed reason=UNEXPECTED error={}", ex.getMessage)
        Future.failed(ex)
    }
  }

  private def validate(request: CreateUserRequest): Unit = {
    val email = request.getEmail.trim.toLowerCase
    if (!EmailValidator.getInstance().isValid(email))
      throw new IllegalArgumentException("Invalid email address")

    if (Normalizer.normalize(request.getFirstName.trim, Normalizer.Form.NFC).length > 100)
      throw new IllegalArgumentException("First name must be at most 100 characters")

    if (Normalizer.normalize(request.getLastName.trim, Normalizer.Form.NFC).length > 100)
      throw new IllegalArgumentException("Last name must be at most 100 characters")

    Option(request.getDateOfBirth).foreach { dob =>
      if (dob.isAfter(LocalDate.now()))
        throw new IllegalArgumentException("Date of birth cannot be in the future")
    }

    trimOpt(request.getCity).foreach { city =>
      if (city.length > 100)
        throw new IllegalArgumentException("City must be at most 100 characters")
    }

    trimOpt(request.getCountry).map(_.toUpperCase).foreach { country =>
      if (!Locale.getISOCountries.contains(country))
        throw new IllegalArgumentException(s"Invalid country code: $country")
    }

    trimOpt(request.getProfilePictureUrl).foreach((url: String) => validateUrl(url, "cloudinary.com", "Profile picture URL"))
    trimOpt(request.getPlaytomicProfileUrl).foreach((url: String) => validateUrl(url, "playtomic.com", "Playtomic profile URL"))

    trimOpt(request.getPhoneNumber).foreach { phone =>
      val region = trimOpt(request.getCountry).map(_.toUpperCase).orNull
      try {
        val parsed = phoneUtil.parse(phone, region)
        if (!phoneUtil.isValidNumber(parsed))
          throw new IllegalArgumentException("Invalid phone number")
      } catch {
        case e: IllegalArgumentException => throw e
        case _: Exception                => throw new IllegalArgumentException("Invalid phone number")
      }
    }
  }

  private def validateUrl(url: String, requiredDomain: String, fieldName: String): Unit = {
    if (url.length > 500)
      throw new IllegalArgumentException(s"$fieldName must be at most 500 characters")
    val host = try new URL(url).getHost catch {
      case _: Exception => throw new IllegalArgumentException(s"$fieldName is not a valid URL")
    }
    if (!host.equals(requiredDomain) && !host.endsWith("." + requiredDomain))
      throw new IllegalArgumentException(s"$fieldName must be a $requiredDomain URL")
  }

  private def buildFromRequest(request: CreateUserRequest): User =
    User.builder()
      .id(UUID.randomUUID())
      .firstName(Normalizer.normalize(request.getFirstName.trim, Normalizer.Form.NFC))
      .lastName(Normalizer.normalize(request.getLastName.trim, Normalizer.Form.NFC))
      .email(request.getEmail.trim.toLowerCase)
      .passwordHash(bcrypt.encode(request.getPassword))
      .phoneNumber(trimOpt(request.getPhoneNumber).map { phone =>
        val region = trimOpt(request.getCountry).map(_.toUpperCase).orNull
        phoneUtil.format(phoneUtil.parse(phone, region), PhoneNumberFormat.E164)
      }.orNull)
      .dateOfBirth(request.getDateOfBirth)
      .city(trimOpt(request.getCity).orNull)
      .country(trimOpt(request.getCountry).map(_.toUpperCase).orNull)
      .profilePictureUrl(trimOpt(request.getProfilePictureUrl).orNull)
      .playtomicProfileUrl(trimOpt(request.getPlaytomicProfileUrl).orNull)
      .status(UserStatus.ACTIVE)
      .build()

  def getUser(userId: UUID): Future[Option[User]] =
    userRepo.getById(userId)
}