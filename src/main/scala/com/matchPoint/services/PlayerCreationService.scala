package com.matchPoint.services

import com.matchPoint.repositories.PlayerRepository
import models.player.external.CreatePlayerRequest
import models.player.internal.Player
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Service

import scala.concurrent.Future

@Service
@Autowired
class PlayerCreationService(
                             playerRepo: PlayerRepository
                           ) {
  def createPlayer(playerRequest: CreatePlayerRequest): Future[Player] = {
    val player = buildFromRequest(playerRequest)
    playerRepo.upsert(player)
  }

  private def buildFromRequest(playerRequest: CreatePlayerRequest): Player = {
    Player
      .builder()
      .username(playerRequest.getUsername)
      .ratingZone(playerRequest.getRatingZone)
      .homeAddress(playerRequest.getHomeAddress)
      .playtomicProfileUrl(playerRequest.getPlaytomicProfileUrl)
      .build()
  }

}
