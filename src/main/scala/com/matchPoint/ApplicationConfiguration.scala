package com.matchPoint

import akka.actor.typed.ActorSystem
import akka.actor.typed.scaladsl.Behaviors
import akka.http.scaladsl.Http
import com.fasterxml.jackson.databind.{ObjectMapper, PropertyNamingStrategies}
import com.fasterxml.jackson.module.scala.DefaultScalaModule
import com.matchPoint.api.PlayerRoutes
import org.springframework.context.annotation.{Bean, Configuration}

import java.util.concurrent.Executors
import scala.concurrent.{ExecutionContext, Future}

@Configuration
class ApplicationConfiguration {

  @Bean
  def actorSystem(): ActorSystem[Nothing] =
    ActorSystem(Behaviors.empty, "matchpoint-system")

  @Bean
  def objectMapper(): ObjectMapper = {
    val mapper = new ObjectMapper()
    mapper.registerModule(DefaultScalaModule)
    mapper.setPropertyNamingStrategy(PropertyNamingStrategies.SNAKE_CASE)
    mapper
  }


  @Bean
  def jdbcExecutionContext(): ExecutionContext =
    ExecutionContext.fromExecutorService(Executors.newFixedThreadPool(16))


  @Bean
  def startServer(
                   system: ActorSystem[Nothing],
                   routes: PlayerRoutes
                 ): Future[Http.ServerBinding] = {
    implicit val sys = system
    Http().newServerAt("localhost", 8080).bind(routes.routes)
  }
}

