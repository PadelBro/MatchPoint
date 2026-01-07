package com.matchPoint.api

import akka.http.scaladsl.server.{Directives, Route}
import org.springframework.stereotype.Service
import org.springframework.beans.factory.annotation.Autowired

import scala.concurrent.ExecutionContext

@Service
@Autowired()
class ApiRoutes(playerRoutes: PlayerRoutes, tournamentRoutes: TournamentRoutes)(implicit ec: ExecutionContext) extends Directives {

  val routes: Route =
    pathPrefix("api") {
      concat(
        playerRoutes.routes,
        tournamentRoutes.routes
      )
    }
}
