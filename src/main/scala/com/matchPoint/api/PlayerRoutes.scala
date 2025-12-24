package com.matchPoint.api

import akka.http.scaladsl.model.StatusCodes
import akka.http.scaladsl.server.{Directives, Route}
import com.matchPoint.services.PlayerCreationService
import com.matchPoint.helpers.JacksonSupport._
import models.player.external.CreatePlayerRequest
import models.player.internal.Player
import org.springframework.stereotype.Service

import scala.concurrent.ExecutionContext

@Service
class PlayerRoutes(playerService: PlayerCreationService)(implicit val ec: ExecutionContext)
  extends Directives {

  val routes: Route =
    pathPrefix("players") {
      pathEndOrSingleSlash {
        post {
          entity(as[CreatePlayerRequest]) { request =>
            onSuccess(playerService.createPlayer(request)) { player: Player =>
              complete(StatusCodes.Created, player)
            }
          }
        }
      }
    }
}
