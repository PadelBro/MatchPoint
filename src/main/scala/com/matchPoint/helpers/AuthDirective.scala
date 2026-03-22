package com.matchPoint.helpers

import akka.http.scaladsl.model.StatusCodes
import akka.http.scaladsl.server.{Directive, Directive1, Directives, Route}
import Directives._
import com.matchPoint.api.ApiError
import com.matchPoint.helpers.JacksonSupport._
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Service

import java.util.UUID

@Service
@Autowired
class AuthDirective(jwtService: JwtService) {

  val authenticate: Directive1[UUID] = Directive[Tuple1[UUID]] { inner: (Tuple1[UUID] => Route) =>
    optionalHeaderValueByName("Authorization") { headerOpt =>
      headerOpt match {
        case Some(value) if value.startsWith("Bearer ") =>
          jwtService.extractUserId(value.stripPrefix("Bearer ")) match {
            case Some(userId) => inner(Tuple1(userId))
            case None         => complete(StatusCodes.Unauthorized, ApiError("UNAUTHORIZED", "Invalid or expired token"))
          }
        case _ =>
          complete(StatusCodes.Unauthorized, ApiError("UNAUTHORIZED", "Missing Authorization header"))
      }
    }
  }
}