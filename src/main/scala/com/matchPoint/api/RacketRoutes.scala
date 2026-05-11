package com.matchPoint.api

import akka.http.scaladsl.server.{Directives, Route}
import com.matchPoint.helpers.JacksonSupport._
import com.matchPoint.services.CloudinaryService
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Service

import scala.concurrent.ExecutionContext

@Service
@Autowired
class RacketRoutes(service: CloudinaryService)(implicit ec: ExecutionContext) extends Directives {

  val routes: Route =
    handleExceptions(ApiExceptionHandler.handler) {
      pathPrefix("rackets") {
        get {
          pathEndOrSingleSlash {
            onSuccess(service.getRackets()) { brands =>
              complete(brands)
            }
          }
        }
      }
    }
}
