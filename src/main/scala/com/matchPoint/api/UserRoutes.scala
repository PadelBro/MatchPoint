package com.matchPoint.api

import akka.http.scaladsl.model.StatusCodes
import akka.http.scaladsl.server.{Directives, Route}
import com.matchPoint.helpers.AuthDirective
import com.matchPoint.helpers.JacksonSupport._
import com.matchPoint.services.UserService
import models.user.external.{CheckAvailabilityRequest, CreateUserRequest, LoginRequest, UpdateUserRequest}
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Service

import java.util.UUID
import scala.concurrent.ExecutionContext

@Service
@Autowired
class UserRoutes(service: UserService, authDirective: AuthDirective)(implicit ec: ExecutionContext) extends Directives {

  val routes: Route =
    handleExceptions(ApiExceptionHandler.handler) {
      pathPrefix("users") {
        concat(
          post {
            concat(
              pathEndOrSingleSlash {
                entity(as[CreateUserRequest]) { request =>
                  onSuccess(service.createUser(request)) { user =>
                    complete(StatusCodes.Created, user)
                  }
                }
              },
              path("login") {
                entity(as[LoginRequest]) { request =>
                  onSuccess(service.login(request)) { response =>
                    complete(response)
                  }
                }
              },
              path("check") {
                entity(as[CheckAvailabilityRequest]) { request =>
                  onComplete(service.checkAvailability(request)) {
                    case scala.util.Success(_)  => complete(StatusCodes.OK)
                    case scala.util.Failure(ex) => throw ex
                  }
                }
              },
              path(JavaUUID) { targetUserId =>
                authDirective.authenticate { authenticatedUserId =>
                  if (authenticatedUserId != targetUserId)
                    complete(StatusCodes.Forbidden, ApiError("FORBIDDEN", "Cannot update another user's account"))
                  else
                    entity(as[UpdateUserRequest]) { request =>
                      onSuccess(service.updateUser(targetUserId, request)) { updated =>
                        complete(StatusCodes.OK, updated)
                      }
                    }
                }
              }
            )
          },
          get {
            path(JavaUUID) { userId =>
              onSuccess(service.getUser(userId)) {
                case Some(user) => complete(user)
                case None       => complete(StatusCodes.NotFound)
              }
            }
          }
        )
      }
    }
}