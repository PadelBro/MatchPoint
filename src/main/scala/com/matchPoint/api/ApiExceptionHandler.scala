package com.matchPoint.api

import akka.http.scaladsl.server.ExceptionHandler
import akka.http.scaladsl.model.StatusCodes
import akka.http.scaladsl.server.Directives.complete
import com.matchPoint.helpers.JacksonSupport._
object ApiExceptionHandler {

  val handler: ExceptionHandler =
    ExceptionHandler {

      case e: IllegalArgumentException =>
        complete(
          StatusCodes.BadRequest,
          ApiError("BAD_REQUEST", e.getMessage)
        )

      case e =>
        e.printStackTrace()
        complete(
          StatusCodes.InternalServerError,
          ApiError("INTERNAL_ERROR", "Unexpected server error")
        )
    }
}
