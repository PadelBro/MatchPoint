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

  private def validateRacketUrl(url: String): Unit = {
    if (url.length > 500)
      throw new IllegalArgumentException("Racket URL must be at most 500 characters")
    val host = try new URL(url).getHost catch {
      case _: Exception => throw new IllegalArgumentException("Racket URL is not a valid URL")
    }
    if (!host.equals("cloudinary.com") && !host.endsWith(".cloudinary.com"))
      throw new IllegalArgumentException("Racket URL must be a cloudinary.com URL")
  }

  def upsertPlayer(playerRequest: UpsertPlayerRequest): Future[Player] = {
    Option(playerRequest.getRacketUrl).filter(_.trim.nonEmpty).foreach(validateRacketUrl)
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
      .racketUrl(Option(playerRequest.getRacketUrl).filter(_.trim.nonEmpty).orNull)
      .racketName(Option(playerRequest.getRacketName).filter(_.trim.nonEmpty).orNull)
      .build()

  def getPlayer(playerId: UUID): Future[Option[Player]] =
    playerRepo.getById(playerId)

  def getPlayerByUserId(userId: UUID): Future[Option[Player]] =
    playerRepo.getByUserId(userId)

  def deletePlayer(playerId: UUID): Future[Boolean] =
    playerRepo.delete(playerId).map { result =>
      if (result.isDefined)
        logger.info("player_deleted id={}", playerId)
      result.isDefined
    }
}