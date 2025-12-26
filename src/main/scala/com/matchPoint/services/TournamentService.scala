package com.matchPoint.services

import com.matchPoint.repositories.TournamentRepository
import models.tournament.Tournament
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Service

import java.util.UUID
import scala.concurrent.{ExecutionContext, Future}

@Service
@Autowired
class TournamentService(tournamentRepo: TournamentRepository)(implicit ec: ExecutionContext) {

  private val logger = LoggerFactory.getLogger(getClass)

  def upsert(tournament: Tournament): Future[Tournament] = {
    validate(tournament)
    logger.info(s"Upserting tournament: id=${tournament.getId} name='${tournament.getName}'")
    tournamentRepo.upsert(tournament).map { t =>
      logger.info(s"Tournament upserted successfully: id=${t.getId} name='${t.getName}'")
      t
    }.recover { case ex =>
      logger.error(s"Failed to upsert tournament id=${tournament.getId}, reason=${ex.getMessage}")
      throw ex
    }
  }

  private def validate(tournament: Tournament): Unit = {
    if (tournament.getStartDate.isAfter(tournament.getEndDate))
      throw new IllegalArgumentException("Start date must be before end date")

    if (tournament.getOrganizerIds.isEmpty)
      throw new IllegalArgumentException("At least one organizer is required")

    if (tournament.getRatingZones.isEmpty)
      throw new IllegalArgumentException("At least one rating zone is required")
  }

  def getTournamentById(tournamentId: UUID): Future[Option[Tournament]] = {
    tournamentRepo.getById(tournamentId).map { result =>
      if (result.isEmpty) logger.warn(s"Tournament not found: id=$tournamentId")
      result
    }
  }

  def getAllByOrganizer(organizerId: UUID): Future[Seq[Tournament]] = {
    logger.info(s"Fetching tournaments for organizerId=$organizerId")
    tournamentRepo.getAllByOrganizer(organizerId)
  }

  def delete(tournamentId: UUID): Future[Boolean] = {
    logger.info(s"Deleting tournament: id=$tournamentId")
    tournamentRepo.delete(tournamentId).map { result =>
      val deleted = result.isDefined
      if (deleted) logger.info(s"Tournament deleted: id=$tournamentId")
      else logger.warn(s"Tournament not found for deletion: id=$tournamentId")
      deleted
    }.recover { case ex =>
      logger.error(s"Failed to delete tournament id=$tournamentId, reason=${ex.getMessage}")
      throw ex
    }
  }
}

