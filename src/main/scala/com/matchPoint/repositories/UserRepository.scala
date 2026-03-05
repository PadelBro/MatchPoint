package com.matchPoint.repositories

import com.fasterxml.jackson.databind.ObjectMapper
import com.matchPoint.helpers.JdbcWrapperTrait
import models.general.JacksonRowMapper
import models.user.internal.User
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate
import org.springframework.stereotype.Repository

import java.sql.Date
import scala.concurrent.{ExecutionContext, Future}

@Repository
@Autowired
class UserRepository(
  val jdbcTemplate: NamedParameterJdbcTemplate,
  mapper: ObjectMapper
)(implicit val ec: ExecutionContext) extends JdbcWrapperTrait {

  implicit private val userRowMapper: JacksonRowMapper[User] =
    new JacksonRowMapper(classOf[User], mapper)

  def insert(user: User): Future[User] =
    jdbcTemplate.querySingle[User](
      """
        |INSERT INTO app_user (
        |  id, first_name, last_name, email, password_hash,
        |  phone_number, date_of_birth, city, country,
        |  profile_picture_url, playtomic_profile_url, status
        |) VALUES (
        |  :id, :firstName, :lastName, :email, :passwordHash,
        |  :phoneNumber, :dateOfBirth, :city, :country,
        |  :profilePictureUrl, :playtomicProfileUrl, :status
        |)
        |RETURNING *
        |""".stripMargin,
      Map(
        "id"                  -> user.getId,
        "firstName"           -> user.getFirstName,
        "lastName"            -> user.getLastName,
        "email"               -> user.getEmail,
        "passwordHash"        -> user.getPasswordHash,
        "phoneNumber"         -> user.getPhoneNumber,
        "dateOfBirth"         -> Option(user.getDateOfBirth).map(Date.valueOf).orNull,
        "city"                -> user.getCity,
        "country"             -> user.getCountry,
        "profilePictureUrl"   -> user.getProfilePictureUrl,
        "playtomicProfileUrl" -> user.getPlaytomicProfileUrl,
        "status"              -> user.getStatus.value
      )
    )
}