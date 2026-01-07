package com.matchPoint.repositories

import com.fasterxml.jackson.databind.ObjectMapper
import com.matchPoint.helpers.JdbcWrapperTrait
import models.general.JacksonRowMapper
import models.player.internal.Player
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate
import org.springframework.stereotype.Repository

import java.util.UUID
import scala.concurrent.{ExecutionContext, Future}


@Repository
@Autowired
class PlayerRepository(val jdbcTemplate: NamedParameterJdbcTemplate, mapper: ObjectMapper)(implicit val ec: ExecutionContext) extends JdbcWrapperTrait {
  implicit private val playerRowMapper: JacksonRowMapper[Player] = new JacksonRowMapper(classOf[Player], mapper)


  def upsert(player: Player): Future[Player] = {
    jdbcTemplate.querySingle[Player](
      """
        |INSERT INTO player (
        |  id,
        |  username,
        |  rating_zone,
        |  home_address,
        |  playtomic_profile_url,
        |  gender,
        |  hand,
        |  court_side
        |) VALUES (
        |  :id,
        |  :username,
        |  :ratingZone,
        |  :homeAddress,
        |  :playtomicProfileUrl,
        |  :gender,
        |  :hand,
        |  :courtSide
        |)
        |ON CONFLICT (id) DO UPDATE SET
        |  username = EXCLUDED.username,
        |  rating_zone = EXCLUDED.rating_zone,
        |  home_address = EXCLUDED.home_address,
        |  playtomic_profile_url = EXCLUDED.playtomic_profile_url,
        |  gender = EXCLUDED.gender,
        |  hand = EXCLUDED.hand,
        |  court_side = EXCLUDED.court_side,
        |  updated_at = extract(epoch from now()) * 1000
        |RETURNING *
        |""".stripMargin,
      Map(
        "id" -> Option(player.getId).getOrElse(java.util.UUID.randomUUID()),
        "username" -> player.getUsername,
        "ratingZone" -> player.getRatingZone.value,
        "homeAddress" -> player.getHomeAddress,
        "playtomicProfileUrl" -> player.getPlaytomicProfileUrl,
        "gender" -> player.getGender.value,
        "hand" -> player.getHand.value,
        "courtSide" -> player.getCourtSide.value
      )
    )
  }

  def getById(playerId: UUID): Future[Option[Player]] = {
    jdbcTemplate.queryOption[Player](
      """
        |SELECT * FROM player WHERE id = :id
        |""".stripMargin,
      Map(
        "id" -> playerId
      )
    )
  }

  def getByUsername(username: String): Future[Option[Player]] = {
    jdbcTemplate.queryOption[Player](
      """
        |SELECT * FROM player WHERE username = :username
        |""".stripMargin,
      Map(
        "username" -> username
      )
    )
  }

  def delete(playerId: UUID): Future[Option[Player]] = {
    jdbcTemplate.queryOption[Player](
      """
        |DELETE FROM player
        |WHERE id = :id
        |RETURNING *
        |""".stripMargin,
      Map("id" -> playerId)
    )
  }
}

