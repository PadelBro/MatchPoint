package com.matchPoint.helpers

import akka.http.scaladsl.marshalling._
import akka.http.scaladsl.model.MediaTypes._
import akka.http.scaladsl.model.{HttpEntity, HttpRequest}
import akka.http.scaladsl.unmarshalling._
import akka.stream.Materializer
import com.fasterxml.jackson.annotation.JsonInclude
import com.fasterxml.jackson.databind._
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule
import com.fasterxml.jackson.module.scala.DefaultScalaModule

import scala.concurrent.duration._
import scala.concurrent.{ExecutionContext, Future}
import scala.language.postfixOps
import scala.reflect.ClassTag

object JacksonSupport {

  private val mapper = new ObjectMapper()
    .registerModule(DefaultScalaModule)
    .registerModule(new JavaTimeModule())
    .setSerializationInclusion(JsonInclude.Include.NON_NULL)

  implicit def JacksonMarshaller: ToEntityMarshaller[AnyRef] = {
    Marshaller.withFixedContentType(`application/json`) { obj =>
      HttpEntity(`application/json`, mapper.writeValueAsString(obj).getBytes("UTF-8"))
    }
  }

  implicit def JacksonUnmarshaller[T <: AnyRef](implicit c: ClassTag[T]): FromRequestUnmarshaller[T] = {
    new FromRequestUnmarshaller[T]{
      override def apply(request: HttpRequest)(implicit ec: ExecutionContext, materializer: Materializer): Future[T] = {
        request.entity.toStrict(5 seconds).map(_.data.decodeString("UTF-8")).map { str =>
          mapper.readValue(str, c.runtimeClass).asInstanceOf[T]
        }
      }
    }
  }

}