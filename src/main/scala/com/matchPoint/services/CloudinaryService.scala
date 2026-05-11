package com.matchPoint.services

import com.fasterxml.jackson.databind.ObjectMapper
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.{Autowired, Value}
import org.springframework.stereotype.Service

import jakarta.annotation.PostConstruct

import java.net.URI
import java.net.http.{HttpClient, HttpRequest, HttpResponse}
import java.util.Base64
import scala.concurrent.{ExecutionContext, Future}
import scala.util.Try

case class RacketModelDto(id: String, name: String, imageUrl: String)
case class RacketYearDto(year: Int, models: List[RacketModelDto])
case class RacketBrandDto(id: String, name: String, years: List[RacketYearDto])

@Service
@Autowired
class CloudinaryService(
  @Value("${cloudinary.cloud-name}")     cloudName:     String,
  @Value("${cloudinary.api-key}")        apiKey:        String,
  @Value("${cloudinary.api-secret}")     apiSecret:     String,
  @Value("${cloudinary.rackets-prefix}") racketsPrefix: String
)(implicit ec: ExecutionContext) {

  private val logger = LoggerFactory.getLogger(getClass)

  private val httpClient = HttpClient.newHttpClient()
  private val mapper     = new ObjectMapper()

  private val cacheTtlMs = 300_600_000L  // 10 hours
  @volatile private var cache: (Long, List[RacketBrandDto]) = (0L, Nil)

  @PostConstruct
  def warmUp(): Unit =
    getRackets().foreach { brands =>
      logger.info("rackets_cache_warmed brands={} total_models={}", brands.size, brands.flatMap(_.years.flatMap(_.models)).size)
    }

  def getRackets(): Future[List[RacketBrandDto]] = Future {
    val (ts, data) = cache
    if (System.currentTimeMillis() - ts < cacheTtlMs && data.nonEmpty) data
    else {
      val fetched = fetchAll()
      cache = (System.currentTimeMillis(), fetched)
      fetched
    }
  }

  private def fetchAll(): List[RacketBrandDto] = {
    if (cloudName.isEmpty || apiKey.isEmpty || apiSecret.isEmpty) {
      logger.warn("cloudinary_not_configured — returning empty racket catalog")
      return Nil
    }
    buildHierarchy(searchPage(None, Nil))
  }

  // Search API (POST) — works for dynamic-folder accounts where public_id is just the filename.
  // Each resource carries asset_folder (e.g. "rackets/adidas/2022/adidas_adipower_3_1_2022")
  // and public_id (the filename). We combine them to reconstruct the full path.
  @scala.annotation.tailrec
  private def searchPage(cursor: Option[String], acc: List[(String, String)]): List[(String, String)] = {
    val credentials = Base64.getEncoder.encodeToString(s"$apiKey:$apiSecret".getBytes("UTF-8"))
    val cursorField = cursor.map(c => s""","next_cursor":"$c"""").getOrElse("")
    val body        = s"""{"expression":"resource_type:image","max_results":500$cursorField}"""

    val request = HttpRequest.newBuilder()
      .uri(URI.create(s"https://api.cloudinary.com/v1_1/$cloudName/resources/search"))
      .header("Authorization", s"Basic $credentials")
      .header("Content-Type", "application/json")
      .POST(HttpRequest.BodyPublishers.ofString(body))
      .build()

    val response = httpClient.send(request, HttpResponse.BodyHandlers.ofString())
    if (response.statusCode() != 200) {
      logger.error("cloudinary_search_failed status={} body={}", response.statusCode(), response.body().take(200))
      throw new RuntimeException(s"Cloudinary Search returned ${response.statusCode()}")
    }

    val root      = mapper.readTree(response.body())
    val resources = root.path("resources")
    val items     = (0 until resources.size()).map { i =>
      val node        = resources.get(i)
      val assetFolder = node.path("asset_folder").asText("")
      val publicId    = node.path("public_id").asText("")
      val secureUrl   = node.path("secure_url").asText("")
      // Full path: asset_folder/public_id  e.g. rackets/adidas/2022/model/filename
      s"$assetFolder/$publicId" -> secureUrl
    }.toList

    val next = Option(root.path("next_cursor").asText()).filter(_.nonEmpty)
    next match {
      case None    => acc ++ items
      case Some(_) => searchPage(next, acc ++ items)
    }
  }

  // Path: rackets/{brand}/{year}/{modelSlug}/{filename}  — parts(0..4)
  private def buildHierarchy(resources: List[(String, String)]): List[RacketBrandDto] =
    resources
      .flatMap { case (path, secureUrl) =>
        val parts = path.split("/")
        // only include paths inside our rackets prefix with at least brand/year/model
        if (parts.length >= 4 && parts(0) == racketsPrefix)
          Try(parts(2).toInt).toOption.map(year => (parts(1), year, parts(3), secureUrl))
        else None
      }
      .groupBy(_._1).toList.sortBy(_._1)
      .map { case (brandId, brandItems) =>
        val years = brandItems
          .groupBy(_._2).toList.sortBy(-_._1)
          .map { case (year, yearItems) =>
            val models = yearItems
              .groupBy(_._3)
              .map { case (slug, items) =>
                RacketModelDto(id = slug, name = toDisplayName(slug), imageUrl = items.head._4)
              }
              .toList.sortBy(_.name)
            RacketYearDto(year, models)
          }
        RacketBrandDto(id = brandId, name = toDisplayName(brandId), years = years)
      }

private def toDisplayName(slug: String): String =
    slug.split("[-_]").filter(_.nonEmpty).map(_.capitalize).mkString(" ")
}
