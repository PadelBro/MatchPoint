package com.matchPoint.api

import akka.http.scaladsl.model.StatusCodes
import akka.http.scaladsl.server.{Directives, Route}
import com.matchPoint.helpers.JacksonSupport._
import com.matchPoint.services.PlayerService
import models.player.external.UpsertPlayerRequest
import org.springframework.stereotype.Service

import scala.concurrent.ExecutionContext

@Service
class PlayerRoutes(service: PlayerService)(implicit ec: ExecutionContext)
  extends Directives {

  val routes: Route =
    handleExceptions(ApiExceptionHandler.handler) {
      pathPrefix("players") {
        concat(
          post {
            pathEndOrSingleSlash {
              entity(as[UpsertPlayerRequest]) { req =>
                onSuccess(service.upsertPlayer(req)) { player =>
                  complete(StatusCodes.Created, player)
                }
              }
            }
          },
          path(JavaUUID) { id =>
            concat(
              get {
                onSuccess(service.getPlayer(id)) {
                  case Some(player) => complete(player)
                  case None         => complete(StatusCodes.NotFound)
                }
              },
              delete {
                onSuccess(service.deletePlayer(id)) {
                  case true  => complete(StatusCodes.NoContent)
                  case false => complete(StatusCodes.NotFound)
                }
              }
            )
          }
        )
      }
    }
}

