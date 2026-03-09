package com.matchPoint.services

import com.matchPoint.repositories.PlayerRepository
import models.player.external.UpsertPlayerRequest
import models.player.internal.Player
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Service
import org.slf4j.LoggerFactory

import java.util.UUID
import scala.concurrent.{ExecutionContext, Future}

@Service
@Autowired
class PlayerService(playerRepo: PlayerRepository)(implicit ec: ExecutionContext) {

  private val logger = LoggerFactory.getLogger(getClass)

  def upsertPlayer(playerRequest: UpsertPlayerRequest): Future[Player] = {
    playerRepo.upsert(buildFromRequest(playerRequest)).map { player =>
      logger.info(
        "player_upserted id={} userId={} rating={} gender={} hand={} courtSide={}",
        player.getId,
        player.getUserId,
        player.getRating,
        player.getGender,
        player.getHand,
        player.getCourtSide
      )
      player
    }.recoverWith {
      case ex: IllegalArgumentException =>
        Future.failed(ex)

      case ex =>
        logger.error(
          "player_upsert_failed_unexpected errorType={}",
          ex.getClass.getSimpleName,
          ex
        )
        Future.failed(ex)
    }
  }

  private def buildFromRequest(playerRequest: UpsertPlayerRequest): Player =
    Player
      .builder()
      .id(Option(playerRequest.getId).getOrElse(java.util.UUID.randomUUID()))
      .userId(playerRequest.getUserId)
      .rating(playerRequest.getRating)
      .hand(playerRequest.getHand)
      .gender(playerRequest.getGender)
      .courtSide(playerRequest.getCourtSide)
      .build()

  def getPlayer(playerId: UUID): Future[Option[Player]] =
    playerRepo.getById(playerId)

  def deletePlayer(playerId: UUID): Future[Boolean] =
    playerRepo.delete(playerId).map { result =>
      if (result.isDefined)
        logger.info("player_deleted id={}", playerId)
      result.isDefined
    }
}