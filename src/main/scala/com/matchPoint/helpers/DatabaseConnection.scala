package com.matchPoint.helpers

import com.typesafe.config.ConfigFactory

import java.sql.{Connection, DriverManager}

class DatabaseConnection {
  private val config = ConfigFactory.load().getConfig("db")

  private val url = config.getString("url")
  private val user = config.getString("user")
  private val password = config.getString("password")
  private val driver = config.getString("driver")

  def getConnection: Connection = {
    Class.forName("org.postgresql.Driver")
    DriverManager.getConnection(url, user, password)
  }
}