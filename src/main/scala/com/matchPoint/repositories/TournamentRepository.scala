package com.matchPoint.repositories

import com.fasterxml.jackson.databind.ObjectMapper
import com.matchPoint.helpers.JdbcWrapperTrait
import models.general.JacksonRowMapper
import models.player.internal.Rating
import models.tournament.internal.{Tournament, TournamentStatus}
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

  def find(
    city: Option[String],
    startDate: Option[Long],
    endDate: Option[Long],
    status: Option[TournamentStatus],
    minRating: Option[Rating],
    maxRating: Option[Rating],
    offset: Option[Int],
    limit: Option[Int]
  ): Future[List[Tournament]] = {
    val conditions = Seq(
      city.filter(_.nonEmpty).map(_ => "city ILIKE :city"),
      startDate.map(_ => "start_date >= :startDate"),
      endDate.map(_ => "end_date <= :endDate"),
      status.map(_ => "status = :status"),
      minRating.map(_ => "min_rating >= :minRating"),
      maxRating.map(_ => "max_rating <= :maxRating")
    ).flatten
    val whereClause = if (conditions.nonEmpty) "AND " + conditions.mkString(" AND ") else ""

    val sql =
      s"""
         |SELECT * FROM tournament
         |WHERE 1 = 1
         |$whereClause
         |ORDER BY start_date ASC
         |LIMIT :limit OFFSET :offset
      """.stripMargin

    jdbcTemplate.queryList[Tournament](sql,
      Map(
        "city"       -> city.orNull,
        "startDate"  -> startDate.map(Long.box).orNull,
        "endDate"    -> endDate.map(Long.box).orNull,
        "status"     -> status.map(_.value).orNull,
        "minRating"  -> minRating.map(r => Float.box(r.value)).orNull,
        "maxRating"  -> maxRating.map(r => Float.box(r.value)).orNull,
        "offset"     -> (offset.getOrElse(0) * limit.getOrElse(25)),
        "limit"      -> limit.getOrElse(25)
      )
    )
  }

  def upsert(tournament: Tournament): Future[Tournament] = {
    jdbcTemplate.querySingle[Tournament](
      """
        |INSERT INTO tournament (
        |  id, name, description, city, prizes, start_date, end_date, status,
        |  organizer_ids, min_rating, max_rating
        |)
        |VALUES (
        |  :id, :name, :description, :city, :prizes, :startDate, :endDate, :status,
        |  :organizerIds::jsonb, :min_rating, :max_rating
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
        |  min_rating = EXCLUDED.min_rating,
        |  max_rating = EXCLUDED.max_rating,
        |  updated_at = extract(epoch from now()) * 1000
        |RETURNING *
        |""".stripMargin,
      Map(
        "id" -> tournament.getId,
        "name" -> tournament.getName,
        "description" -> tournament.getDescription,
        "city" -> tournament.getCity,
        "prizes" -> tournament.getPrizes,
        "startDate" -> tournament.getStartDate,
        "endDate" -> tournament.getEndDate,
        "status" -> tournament.getStatus.value,
        "organizerIds" -> mapper.writeValueAsString(tournament.getOrganizerIds),
        "min_rating" -> tournament.getMinRating.value,
        "max_rating" -> tournament.getMaxRating.value
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
