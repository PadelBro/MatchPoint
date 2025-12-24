package com.matchPoint.helpers

import com.typesafe.config.{Config, ConfigFactory}
import org.flywaydb.core.Flyway

object FlywayMigration {
  def runFlywayMigration(): Unit = {
    val config: Config = ConfigFactory.load("application.properties")
    // Extract Flyway properties
    val url = config.getString("flyway.url")
    val user = config.getString("flyway.user")
    val password = config.getString("flyway.password")
    val locations = config.getString("flyway.locations")

    val flyway = Flyway.configure()
      .dataSource(url, user, password)
      .locations(locations)
      .load()
    try {
      val migrationsCount = flyway.migrate()

      println(s"Successfully applied ${migrationsCount.migrationsExecuted} migrations!")
    } catch {
      case e: Exception =>
        println("Error running Flyway migration")
        e.printStackTrace()
    }
  }
}