package com.matchPoint.helpers

import JdbcWrapperTrait.jdbcExecutionContext
import org.springframework.jdbc.core.RowMapper
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate

import java.util.concurrent.Executors
import scala.concurrent.{ExecutionContext, Future, blocking}
import scala.jdk.CollectionConverters._

object JdbcWrapperTrait {
  val jdbcExecutionContext: ExecutionContext =
    ExecutionContext.fromExecutorService(Executors.newCachedThreadPool())
}

trait JdbcWrapperTrait {
  implicit final def wrapJdbc(
                               jdbcTemplate: NamedParameterJdbcTemplate
                             ): JdbcWrapper =
    new JdbcWrapper(jdbcTemplate)
}

class JdbcWrapper(jdbcTemplate: NamedParameterJdbcTemplate) {
  def queryList[T](
                    sql: String,
                    params: Map[String, Any] = Map.empty
                  )(implicit rowMapper: RowMapper[T]): Future[List[T]] =
    Future {
      blocking {
        jdbcTemplate
          .query(sql, params.asJava, rowMapper)
          .asScala
          .toList
      }
    }(jdbcExecutionContext)

  def queryOption[T](
                      sql: String,
                      params: Map[String, Any] = Map.empty
                    )(implicit rowMapper: RowMapper[T]): Future[Option[T]] =
    queryList(sql, params).map(_.headOption)(jdbcExecutionContext)

  def querySingle[T](
                      sql: String,
                      params: Map[String, Any] = Map.empty
                    )(implicit rowMapper: RowMapper[T]): Future[T] =
    queryOption(sql, params).map {
      case None          => throw new NoSuchElementException("Expected 1 row, got 0")
      case Some(value)  => value
    }(jdbcExecutionContext)
}
