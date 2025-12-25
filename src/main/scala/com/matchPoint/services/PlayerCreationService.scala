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
    if (request.getUsername.trim.length < 3)
      throw new IllegalArgumentException("username must be at least 3 characters")

    try new URL(request.getPlaytomicProfileUrl)
    catch {
      case _: Exception =>
        throw new IllegalArgumentException("invalid playtomic profile Url")
    }

    playerRepo
      .getByUsername(request.getUsername)
      .map {
        case Some(_) => throw new IllegalArgumentException("username already taken")
        case None => ()
      }
  }

  def getPlayer(playerId: UUID): Future[Option[Player]] = {
    playerRepo.getById(playerId)
  }

  def deletePlayer(playerId: UUID): Future[Boolean] =
    playerRepo.delete(playerId).map(_.isDefined)
}
