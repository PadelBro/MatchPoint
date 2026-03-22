package com.matchPoint.api

import akka.http.scaladsl.model.StatusCodes
import akka.http.scaladsl.server.{Directives, Route}
import com.matchPoint.helpers.{AuthDirective, JacksonSupport}
import JacksonSupport._
import com.matchPoint.services.TournamentService
import models.tournament.external.{FilterTournamentsRequest, UpsertTournamentRequest}
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Service

import scala.concurrent.ExecutionContext

@Service
@Autowired
class TournamentRoutes(service: TournamentService, auth: AuthDirective)(implicit ec: ExecutionContext) extends Directives {

  val routes: Route =
    handleExceptions(ApiExceptionHandler.handler) {
      pathPrefix("tournaments") {
        concat(
          post {
            concat(
              pathEndOrSingleSlash {
                auth.authenticate { organizerId =>
                  entity(as[UpsertTournamentRequest]) { req =>
                    val withOrganizer = req.toBuilder()
                      .organizerIds(java.util.List.of(organizerId))
                      .build()
                    onSuccess(service.upsert(withOrganizer)) { created =>
                      complete(StatusCodes.Created, created)
                    }
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