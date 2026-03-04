package com.matchPoint.services

import com.matchPoint.repositories.PlayerRepository
import models.player.external.UpsertPlayerRequest
import models.player.internal.{Gender, Player, Rating, Side}
import org.mockito.ArgumentMatchers.any
import org.mockito.Mockito
import org.mockito.Mockito.when
import org.scalatest.BeforeAndAfterEach
import org.scalatest.concurrent.ScalaFutures
import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers

import java.util.UUID
import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future

class PlayerServiceSpec extends AnyFlatSpec with Matchers with ScalaFutures with BeforeAndAfterEach {

  private val repo    = Mockito.mock(classOf[PlayerRepository])
  private val service = new PlayerService(repo)

  override def beforeEach(): Unit = Mockito.reset(repo)

  private def validRequest(username: String = "testuser") =
    UpsertPlayerRequest.builder()
      .username(username)
      .rating(Rating.R35)
      .homeAddress("Amsterdam")
      .gender(Gender.MALE)
      .hand(Side.RIGHT)
      .courtSide(Side.LEFT)
      .build()

  private def player(username: String = "testuser") =
    Player.builder()
      .id(UUID.randomUUID())
      .username(username)
      .rating(Rating.R35)
      .homeAddress("Amsterdam")
      .gender(Gender.MALE)
      .hand(Side.RIGHT)
      .courtSide(Side.LEFT)
      .build()

  // ── upsertPlayer ─────────────────────────────────────────────────────────────

  "upsertPlayer" should "delegate to repo and return the created player" in {
    val p = player()
    when(repo.getByUsername(any())).thenReturn(Future.successful(None))
    when(repo.upsert(any())).thenReturn(Future.successful(p))
    service.upsertPlayer(validRequest()).futureValue shouldBe p
  }

  it should "fail when username is shorter than 3 characters" in {
    service.upsertPlayer(validRequest("ab")).failed.futureValue shouldBe an[IllegalArgumentException]
  }

  it should "fail when username is longer than 30 characters" in {
    service.upsertPlayer(validRequest("a" * 31)).failed.futureValue shouldBe an[IllegalArgumentException]
  }

  it should "fail when username is exactly 3 characters — boundary passes" in {
    val p = player("abc")
    when(repo.getByUsername(any())).thenReturn(Future.successful(None))
    when(repo.upsert(any())).thenReturn(Future.successful(p))
    service.upsertPlayer(validRequest("abc")).futureValue shouldBe p
  }

  it should "fail when username is exactly 30 characters — boundary passes" in {
    val name = "a" * 30
    val p    = player(name)
    when(repo.getByUsername(any())).thenReturn(Future.successful(None))
    when(repo.upsert(any())).thenReturn(Future.successful(p))
    service.upsertPlayer(validRequest(name)).futureValue shouldBe p
  }

  it should "fail when username is already taken" in {
    when(repo.getByUsername(any())).thenReturn(Future.successful(Some(player())))
    service.upsertPlayer(validRequest()).failed.futureValue shouldBe an[IllegalArgumentException]
  }

  it should "fail when playtomicProfileUrl is not a valid URL" in {
    val req = UpsertPlayerRequest.builder()
      .username("testuser")
      .rating(Rating.R35)
      .homeAddress("Amsterdam")
      .gender(Gender.MALE)
      .hand(Side.RIGHT)
      .courtSide(Side.LEFT)
      .playtomicProfileUrl("not-a-url")
      .build()

    service.upsertPlayer(req).failed.futureValue shouldBe an[IllegalArgumentException]
  }

  it should "succeed with a valid playtomicProfileUrl" in {
    val p = player()
    val req = UpsertPlayerRequest.builder()
      .username("testuser")
      .rating(Rating.R35)
      .homeAddress("Amsterdam")
      .gender(Gender.MALE)
      .hand(Side.RIGHT)
      .courtSide(Side.LEFT)
      .playtomicProfileUrl("https://playtomic.io/user/123")
      .build()

    when(repo.getByUsername(any())).thenReturn(Future.successful(None))
    when(repo.upsert(any())).thenReturn(Future.successful(p))
    service.upsertPlayer(req).futureValue shouldBe p
  }

  it should "treat a null playtomicProfileUrl as absent and not validate it" in {
    val p = player()
    when(repo.getByUsername(any())).thenReturn(Future.successful(None))
    when(repo.upsert(any())).thenReturn(Future.successful(p))
    service.upsertPlayer(validRequest()).futureValue shouldBe p
  }

  // ── getPlayer ────────────────────────────────────────────────────────────────

  "getPlayer" should "return Some when player exists" in {
    val id = UUID.randomUUID()
    val p  = player()
    when(repo.getById(id)).thenReturn(Future.successful(Some(p)))
    service.getPlayer(id).futureValue shouldBe Some(p)
  }

  it should "return None when player does not exist" in {
    val id = UUID.randomUUID()
    when(repo.getById(id)).thenReturn(Future.successful(None))
    service.getPlayer(id).futureValue shouldBe None
  }

  // ── deletePlayer ─────────────────────────────────────────────────────────────

  "deletePlayer" should "return true when player existed and was deleted" in {
    val id = UUID.randomUUID()
    when(repo.delete(id)).thenReturn(Future.successful(Some(player())))
    service.deletePlayer(id).futureValue shouldBe true
  }

  it should "return false when player does not exist" in {
    val id = UUID.randomUUID()
    when(repo.delete(id)).thenReturn(Future.successful(None))
    service.deletePlayer(id).futureValue shouldBe false
  }
}