package com.matchPoint.services

import com.matchPoint.repositories.PlayerRepository
import models.player.external.UpsertPlayerRequest
import models.player.internal.Player
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Service

import java.net.URL
import java.util.UUID
import scala.concurrent.{ExecutionContext, Future}

@Service
@Autowired
class PlayerCreationService(playerRepo: PlayerRepository)(implicit ec: ExecutionContext) {
  def upsertPlayer(playerRequest: UpsertPlayerRequest): Future[Player] = {
    for {
      _ <- validate(playerRequest)
      preparedPlayer = buildFromRequest(playerRequest)
      player <- playerRepo.upsert(preparedPlayer)
    } yield player
  }

  private def buildFromRequest(playerRequest: UpsertPlayerRequest): Player = {
    Player
      .builder()
      .id(playerRequest.getId)
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

    if (username.length < 3 || username.length > 30)
      return Future.failed(
        new IllegalArgumentException("username must be between 3 and 30 characters")
      )

    Option(request.getPlaytomicProfileUrl)
      .map(_.trim)
      .filter(_.nonEmpty)
      .foreach { url =>
        try new URL(url)
        catch {
          case _: Exception =>
            return Future.failed(
              new IllegalArgumentException("invalid playtomic profile URL")
            )
        }
      }

    playerRepo.getByUsername(username).flatMap {
      case Some(_) =>
        Future.failed(new IllegalArgumentException("username already taken"))
      case None =>
        Future.successful(())
    }
  }

  def getPlayer(playerId: UUID): Future[Option[Player]] = {
    playerRepo.getById(playerId)
  }

  def deletePlayer(playerId: UUID): Future[Boolean] =
    playerRepo.delete(playerId).map(_.isDefined)
}
