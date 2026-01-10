package com.matchPoint.services

import com.matchPoint.repositories.TournamentRepository
import models.player.internal.Rating
import models.tournament.external.UpsertTournamentRequest
import models.tournament.internal.Tournament
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Service

import java.util.UUID
import scala.concurrent.{ExecutionContext, Future}
import scala.jdk.CollectionConverters.{CollectionHasAsScala, SeqHasAsJava}

@Service
@Autowired
class TournamentService(tournamentRepo: TournamentRepository)(implicit ec: ExecutionContext) {

  private val logger = LoggerFactory.getLogger(getClass)

  def upsert(tournamentRequest: UpsertTournamentRequest): Future[Tournament] = {
    validate(tournamentRequest)
    logger.info(s"Upserting tournament: id=${tournamentRequest.getId} name='${tournamentRequest.getName}'")
    val preparedTournament = buildFromRequest(tournamentRequest)
    tournamentRepo.upsert(preparedTournament).map { t =>
      logger.info(s"Tournament upserted successfully: id=${t.getId} name='${t.getName}'")
      t
    }.recover { case ex =>
      logger.error(s"Failed to upsert tournament id=${preparedTournament.getId}, reason=${ex.getMessage}")
      throw ex
    }
  }

  private def validate(tournamentRequest: UpsertTournamentRequest): Unit = {
    if (tournamentRequest.getStartDate.isAfter(tournamentRequest.getEndDate))
      throw new IllegalArgumentException("Start date must be before end date")

    if (tournamentRequest.getOrganizerIds.isEmpty)
      throw new IllegalArgumentException("At least one organizer is required")
  }

  private def buildFromRequest(tournamentRequest: UpsertTournamentRequest): Tournament = {
    Tournament
      .builder()
      .id(Option(tournamentRequest.getId).getOrElse(java.util.UUID.randomUUID()))
      .name(tournamentRequest.getName)
      .description(tournamentRequest.getDescription)
      .city(tournamentRequest.getCity)
      .prizes(tournamentRequest.getPrizes)
      .startDate(tournamentRequest.getStartDate.toEpochMilli)
      .endDate(tournamentRequest.getEndDate.toEpochMilli)
      .organizerIds(tournamentRequest.getOrganizerIds)
      .status(tournamentRequest.getStatus)
      .minRating(tournamentRequest.getMinRating)
      .maxRating(tournamentRequest.getMaxRating)
      .build()
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

