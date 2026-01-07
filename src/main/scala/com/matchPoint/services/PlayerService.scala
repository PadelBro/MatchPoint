package com.matchPoint.services

import com.matchPoint.repositories.PlayerRepository
import models.player.external.UpsertPlayerRequest
import models.player.internal.Player
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Service
import org.slf4j.LoggerFactory

import java.net.URL
import java.util.UUID
import scala.concurrent.{ExecutionContext, Future}

@Service
@Autowired
class PlayerService(playerRepo: PlayerRepository)(implicit ec: ExecutionContext) {

  private val logger = LoggerFactory.getLogger(getClass)

  def upsertPlayer(playerRequest: UpsertPlayerRequest): Future[Player] = {
    for {
      _ <- validate(playerRequest)
      preparedPlayer = buildFromRequest(playerRequest)
      player <- playerRepo.upsert(preparedPlayer)
    } yield {
      logger.info(
        "player_upserted id={} ratingZone={} gender={} hand={} courtSide={}",
        player.getId,
        player.getRatingZone,
        player.getGender,
        player.getHand,
        player.getCourtSide
      )
      player
    }
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

  private def buildFromRequest(playerRequest: UpsertPlayerRequest): Player = {
    Player
      .builder()
      .id(Option(playerRequest.getId).getOrElse(java.util.UUID.randomUUID()))
      .username(playerRequest.getUsername)
      .ratingZone(playerRequest.getRatingZone)
      .homeAddress(playerRequest.getHomeAddress)
      .hand(playerRequest.getHand)
      .gender(playerRequest.getGender)
      .courtSide(playerRequest.getCourtSide)
      .playtomicProfileUrl(playerRequest.getPlaytomicProfileUrl)
      .build()
  }

  private def validate(request: UpsertPlayerRequest): Future[Unit] = {
    val username = request.getUsername.trim

    if (username.length < 3 || username.length > 30) {
      logger.warn(
        "player_validation_failed rule=USERNAME_LENGTH length={}",
        username.length
      )
      return Future.failed(
        new IllegalArgumentException("username must be between 3 and 30 characters")
      )
    }

    Option(request.getPlaytomicProfileUrl)
      .map(_.trim)
      .filter(_.nonEmpty)
      .foreach { url =>
        try new URL(url)
        catch {
          case _: Exception =>
            logger.warn(
              "player_validation_failed rule=INVALID_PLAYTOMIC_URL"
            )
            return Future.failed(
              new IllegalArgumentException("invalid playtomic profile URL")
            )
        }
      }

    playerRepo.getByUsername(username).flatMap {
      case Some(existing) =>
        logger.warn(
          "player_validation_failed rule=USERNAME_TAKEN existingPlayerId={}",
          existing.getId
        )
        Future.failed(new IllegalArgumentException("username already taken"))

      case None =>
        Future.successful(())
    }
  }

  def getPlayer(playerId: UUID): Future[Option[Player]] = {
    playerRepo.getById(playerId)
  }

  def deletePlayer(playerId: UUID): Future[Boolean] =
    playerRepo.delete(playerId).map { result =>
      if (result.isDefined)
        logger.info("player_deleted id={}", playerId)
      result.isDefined
    }
}
