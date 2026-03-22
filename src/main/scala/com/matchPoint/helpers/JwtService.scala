package com.matchPoint.helpers

import io.jsonwebtoken.Jwts
import io.jsonwebtoken.io.Decoders
import io.jsonwebtoken.security.Keys
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service

import java.util.{Date, UUID}

@Service
class JwtService(
  @Value("${jwt.secret}") secret: String,
  @Value("${jwt.expiration.ms}") expirationMs: Long
) {

  private val key = Keys.hmacShaKeyFor(Decoders.BASE64.decode(secret))

  def generateToken(userId: UUID): String =
    Jwts.builder()
      .subject(userId.toString)
      .issuedAt(new Date())
      .expiration(new Date(System.currentTimeMillis() + expirationMs))
      .signWith(key)
      .compact()

  def extractUserId(token: String): Option[UUID] =
    try {
      val subject = Jwts.parser()
        .verifyWith(key)
        .build()
        .parseSignedClaims(token)
        .getPayload
        .getSubject
      Some(UUID.fromString(subject))
    } catch {
      case _: Exception => None
    }
}