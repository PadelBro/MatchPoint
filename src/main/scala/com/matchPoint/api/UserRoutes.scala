package com.matchPoint.api

import akka.http.scaladsl.model.StatusCodes
import akka.http.scaladsl.server.{Directives, Route}
import com.matchPoint.helpers.JacksonSupport._
import com.matchPoint.services.UserService
import models.user.external.CreateUserRequest
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Service

import scala.concurrent.ExecutionContext

@Service
@Autowired
class UserRoutes(service: UserService)(implicit ec: ExecutionContext) extends Directives {

  val routes: Route =
    handleExceptions(ApiExceptionHandler.handler) {
      pathPrefix("users") {
        post {
          pathEndOrSingleSlash {
            entity(as[CreateUserRequest]) { request =>
              onSuccess(service.createUser(request)) { user =>
                complete(StatusCodes.Created, user)
              }
            }
          }
        }
      }
    }
}