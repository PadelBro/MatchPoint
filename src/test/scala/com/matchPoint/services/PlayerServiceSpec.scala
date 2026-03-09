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

  private val userId = UUID.randomUUID()

  private def validRequest() =
    UpsertPlayerRequest.builder()
      .userId(userId)
      .rating(Rating.R35)
      .gender(Gender.MALE)
      .hand(Side.RIGHT)
      .courtSide(Side.LEFT)
      .build()

  private def player() =
    Player.builder()
      .id(UUID.randomUUID())
      .userId(userId)
      .rating(Rating.R35)
      .gender(Gender.MALE)
      .hand(Side.RIGHT)
      .courtSide(Side.LEFT)
      .build()

  // ── upsertPlayer ─────────────────────────────────────────────────────────────

  "upsertPlayer" should "delegate to repo and return the created player" in {
    val p = player()
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