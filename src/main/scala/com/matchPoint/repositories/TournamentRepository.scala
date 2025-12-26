package com.matchPoint.repositories

import com.fasterxml.jackson.databind.ObjectMapper
import com.matchPoint.helpers.JdbcWrapperTrait
import models.general.JacksonRowMapper
import models.tournament.Tournament
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate
import org.springframework.stereotype.Repository

import java.util.UUID
import scala.concurrent.{ExecutionContext, Future}

@Repository
@Autowired
class TournamentRepository(
                            val jdbcTemplate: NamedParameterJdbcTemplate,
                            mapper: ObjectMapper
                          )(implicit val ec: ExecutionContext)
  extends JdbcWrapperTrait {

  implicit private val tournamentRowMapper: JacksonRowMapper[Tournament] =
    new JacksonRowMapper(classOf[Tournament], mapper)

  def getById(tournamentId: UUID): Future[Option[Tournament]] = {
    jdbcTemplate.queryOption[Tournament](
      """
        |SELECT * FROM tournament WHERE id = :id
        |""".stripMargin,
      Map("id" -> tournamentId)
    )
  }

  def getAllByOrganizer(organizerId: UUID): Future[Seq[Tournament]] = {
    jdbcTemplate.queryList[Tournament](
      """
        |SELECT * FROM tournament
        |WHERE organizer_ids @> CAST(:organizerId AS jsonb)
        |ORDER BY start_date ASC
        |""".stripMargin,
      Map("organizerId" -> s"""["$organizerId"]""")
    )
  }

  def upsert(tournament: Tournament): Future[Tournament] = {
    jdbcTemplate.querySingle[Tournament](
      """
        |INSERT INTO tournament (
        |  id, name, description, city, prizes, start_date, end_date, status,
        |  organizer_ids, rating_zones, created_at, updated_at
        |)
        |VALUES (
        |  :id, :name, :description, :city, :prizes, :startDate, :endDate, :status,
        |  :organizerIds, :ratingZones, :createdAt, :updatedAt
        |)
        |ON CONFLICT (id) DO UPDATE SET
        |  name = EXCLUDED.name,
        |  description = EXCLUDED.description,
        |  city = EXCLUDED.city,
        |  prizes = EXCLUDED.prizes,
        |  start_date = EXCLUDED.start_date,
        |  end_date = EXCLUDED.end_date,
        |  status = EXCLUDED.status,
        |  organizer_ids = EXCLUDED.organizer_ids,
        |  rating_zones = EXCLUDED.rating_zones,
        |  updated_at = EXCLUDED.updated_at
        |RETURNING *
        |""".stripMargin,
      Map(
        "id" -> tournament.getId,
        "name" -> tournament.getName,
        "description" -> tournament.getDescription,
        "city" -> tournament.getCity,
        "prizes" -> tournament.getPrizes,
        "startDate" -> tournament.getStartDate.toEpochMilli,
        "endDate" -> tournament.getEndDate.toEpochMilli,
        "status" -> tournament.getStatus.name(),
        "organizerIds" -> mapper.writeValueAsString(tournament.getOrganizerIds),
        "ratingZones" -> mapper.writeValueAsString(tournament.getRatingZones),
        "createdAt" -> tournament.getCreatedAt,
        "updatedAt" -> tournament.getUpdatedAt
      )
    )
  }

  def delete(tournamentId: UUID): Future[Option[Tournament]] = {
    jdbcTemplate.queryOption[Tournament](
      """
        |DELETE FROM tournament
        |WHERE id = :id
        |RETURNING *
        |""".stripMargin,
      Map("id" -> tournamentId)
    )
  }
}
