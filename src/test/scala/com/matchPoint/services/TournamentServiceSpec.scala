package com.matchPoint.services

import com.matchPoint.repositories.TournamentRepository
import models.player.internal.Rating
import models.tournament.external.{FilterTournamentsRequest, UpsertTournamentRequest}
import models.tournament.internal.{Tournament, TournamentStatus}
import org.mockito.ArgumentCaptor
import org.mockito.ArgumentMatchers.any
import org.mockito.Mockito
import org.mockito.Mockito.{verify, when}
import org.scalatest.BeforeAndAfterEach
import org.scalatest.concurrent.ScalaFutures
import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers

import java.util.UUID
import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future
import scala.jdk.CollectionConverters.SeqHasAsJava

class TournamentServiceSpec extends AnyFlatSpec with Matchers with ScalaFutures with BeforeAndAfterEach {

  private val repo    = Mockito.mock(classOf[TournamentRepository])
  private val service = new TournamentService(repo)

  override def beforeEach(): Unit = Mockito.reset(repo)

  private val organizerId = UUID.randomUUID()

  private def validRequest(startDate: Long = 1000L, endDate: Long = 2000L) =
    UpsertTournamentRequest.builder()
      .name("Test Cup")
      .city("Amsterdam")
      .startDate(startDate)
      .endDate(endDate)
      .organizerIds(List(organizerId).asJava)
      .status(TournamentStatus.PENDING)
      .minRating(Rating.R30)
      .maxRating(Rating.R50)
      .build()

  private def tournament(id: UUID = UUID.randomUUID()) =
    Tournament.builder()
      .id(id)
      .name("Test Cup")
      .city("Amsterdam")
      .startDate(1000L)
      .endDate(2000L)
      .organizerIds(List(organizerId).asJava)
      .status(TournamentStatus.PENDING)
      .minRating(Rating.R30)
      .maxRating(Rating.R50)
      .build()

  // ── upsert ──────────────────────────────────────────────────────────────────

  "upsert" should "delegate to repo and return the created tournament" in {
    val t = tournament()
    when(repo.upsert(any())).thenReturn(Future.successful(t))
    service.upsert(validRequest()).futureValue shouldBe t
  }

  it should "throw synchronously when startDate equals endDate" in {
    intercept[IllegalArgumentException] {
      service.upsert(validRequest(startDate = 1000L, endDate = 1000L))
    }.getMessage should include("Start date")
  }

  it should "throw synchronously when startDate is after endDate" in {
    intercept[IllegalArgumentException] {
      service.upsert(validRequest(startDate = 3000L, endDate = 1000L))
    }.getMessage should include("Start date")
  }

  it should "throw synchronously when organizerIds is empty" in {
    val req = UpsertTournamentRequest.builder()
      .name("Test Cup")
      .city("Amsterdam")
      .startDate(1000L)
      .endDate(2000L)
      .organizerIds(List.empty[UUID].asJava)
      .status(TournamentStatus.PENDING)
      .minRating(Rating.R30)
      .maxRating(Rating.R50)
      .build()

    intercept[IllegalArgumentException] {
      service.upsert(req)
    }.getMessage should include("organizer")
  }

  // ── filter ───────────────────────────────────────────────────────────────────

  "filter" should "delegate to repo and return the result list" in {
    val list = List(tournament(), tournament())
    when(repo.find(any(), any(), any(), any(), any(), any(), any(), any()))
      .thenReturn(Future.successful(list))

    service.filter(FilterTournamentsRequest.builder().build()).futureValue shouldBe list
  }

  it should "pass city as Some when set in request" in {
    val captor = ArgumentCaptor.forClass(classOf[Option[_]]).asInstanceOf[ArgumentCaptor[Option[String]]]
    when(repo.find(any(), any(), any(), any(), any(), any(), any(), any()))
      .thenReturn(Future.successful(List.empty))

    val req = FilterTournamentsRequest.builder().city("Amsterdam").build()
    service.filter(req).futureValue

    verify(repo).find(captor.capture(), any(), any(), any(), any(), any(), any(), any())
    captor.getValue shouldBe Some("Amsterdam")
  }

  it should "pass None for city when not set in request" in {
    val captor = ArgumentCaptor.forClass(classOf[Option[_]]).asInstanceOf[ArgumentCaptor[Option[String]]]
    when(repo.find(any(), any(), any(), any(), any(), any(), any(), any()))
      .thenReturn(Future.successful(List.empty))

    service.filter(FilterTournamentsRequest.builder().build()).futureValue

    verify(repo).find(captor.capture(), any(), any(), any(), any(), any(), any(), any())
    captor.getValue shouldBe None
  }

  it should "pass status filter when set in request" in {
    val captor = ArgumentCaptor.forClass(classOf[Option[_]]).asInstanceOf[ArgumentCaptor[Option[TournamentStatus]]]
    when(repo.find(any(), any(), any(), any(), any(), any(), any(), any()))
      .thenReturn(Future.successful(List.empty))

    val req = FilterTournamentsRequest.builder().status(TournamentStatus.ACTIVE).build()
    service.filter(req).futureValue

    verify(repo).find(any(), any(), any(), captor.capture(), any(), any(), any(), any())
    captor.getValue shouldBe Some(TournamentStatus.ACTIVE)
  }

  // ── getTournamentById ────────────────────────────────────────────────────────

  "getTournamentById" should "return Some when tournament exists" in {
    val id = UUID.randomUUID()
    val t  = tournament(id)
    when(repo.getById(id)).thenReturn(Future.successful(Some(t)))
    service.getTournamentById(id).futureValue shouldBe Some(t)
  }

  it should "return None when tournament does not exist" in {
    val id = UUID.randomUUID()
    when(repo.getById(id)).thenReturn(Future.successful(None))
    service.getTournamentById(id).futureValue shouldBe None
  }

  // ── getAllByOrganizer ────────────────────────────────────────────────────────

  "getAllByOrganizer" should "return all tournaments for the given organizer" in {
    val id   = UUID.randomUUID()
    val list = Seq(tournament(), tournament())
    when(repo.getAllByOrganizer(id)).thenReturn(Future.successful(list))
    service.getAllByOrganizer(id).futureValue shouldBe list
  }

  // ── delete ───────────────────────────────────────────────────────────────────

  "delete" should "return true when the tournament existed and was deleted" in {
    val id = UUID.randomUUID()
    when(repo.delete(id)).thenReturn(Future.successful(Some(tournament(id))))
    service.delete(id).futureValue shouldBe true
  }

  it should "return false when the tournament does not exist" in {
    val id = UUID.randomUUID()
    when(repo.delete(id)).thenReturn(Future.successful(None))
    service.delete(id).futureValue shouldBe false
  }
}
