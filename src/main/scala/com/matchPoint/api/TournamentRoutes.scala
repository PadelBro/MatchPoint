package com.matchPoint.api

import akka.http.scaladsl.model.StatusCodes
import akka.http.scaladsl.server.{Directives, Route}
import com.matchPoint.services.TournamentService
import com.matchPoint.helpers.JacksonSupport._
import models.tournament.external.{FilterTournamentsRequest, UpsertTournamentRequest}
import org.springframework.stereotype.Service

import scala.concurrent.ExecutionContext

@Service
class TournamentRoutes(service: TournamentService)(implicit ec: ExecutionContext) extends Directives {

  val routes: Route =
    handleExceptions(ApiExceptionHandler.handler) {
      pathPrefix("tournaments") {
        concat(
          post {
            concat(
              pathEndOrSingleSlash {
                entity(as[UpsertTournamentRequest]) { tournament =>
                  onSuccess(service.upsert(tournament)) { created =>
                    complete(StatusCodes.Created, created)
                  }
                }
              },
              path("filter") {
                entity(as[FilterTournamentsRequest]) { filters =>
                  onSuccess(service.filter(filters)) { tournaments =>
                    complete(tournaments)
                  }
                }
              }
            )
          },
          path(JavaUUID) { id =>
            concat(
              get {
                onSuccess(service.getTournamentById(id)) {
                  case Some(tournament) => complete(tournament)
                  case None             => complete(StatusCodes.NotFound)
                }
              },
              delete {
                onSuccess(service.delete(id)) {
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

