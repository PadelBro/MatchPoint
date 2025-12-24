package com.matchPoint.repositories

import com.fasterxml.jackson.databind.ObjectMapper
import com.matchPoint.helpers.JdbcWrapperTrait
import models.general.JacksonRowMapper
import models.player.internal.Player
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate
import org.springframework.stereotype.Repository

import scala.concurrent.{ExecutionContext, Future}


@Repository
@Autowired
class PlayerRepository(val jdbcTemplate: NamedParameterJdbcTemplate, mapper: ObjectMapper)(implicit val ec: ExecutionContext) extends JdbcWrapperTrait {
  implicit private val playerRowMapper: JacksonRowMapper[Player] = new JacksonRowMapper(classOf[Player], mapper)


  def upsert(player: Player): Future[Player] = {
    jdbcTemplate.querySingle[Player](
      """
        |INSERT INTO player (
        |  username, rating_zone, home_address, playtomic_profile_url
        |) VALUES (
        |  :username, :ratingZone, :homeAddress, :playtomicProfileUrl
        |)
        |ON CONFLICT (id) DO UPDATE SET
        |  username = EXCLUDED.username,
        |  rating_zone = EXCLUDED.rating_zone,
        |  home_address = EXCLUDED.home_address,
        |  playtomic_profile_url = EXCLUDED.playtomic_profile_url,
        |  updated_at = extract(epoch from now()) * 1000
        |RETURNING *
        |""".stripMargin,
      Map(
        "username" -> player.getUsername,
        "ratingZone" -> player.getRatingZone.value,
        "homeAddress" -> player.getHomeAddress,
        "playtomicProfileUrl" -> player.getPlaytomicProfileUrl,
      )
    )
  }
}

