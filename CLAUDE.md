# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

MatchPoint is a padel tournament management platform. Scala/Spring Boot backend with Akka HTTP, React/TypeScript frontend.

GitHub: https://github.com/PadelBro/MatchPoint.git

## Commands

### Backend
```bash
./gradlew build          # compile + test
./gradlew run            # run server (requires build first)
./gradlew test           # run all tests
./gradlew test --tests "com.matchPoint.services.PlayerServiceSpec"  # single test class
```

### Frontend
```bash
cd frontend && npm i && npm run dev   # install deps + start dev server
```

### Database
```bash
docker-compose up -d   # start PostgreSQL on port 5433
```
Credentials: username `admin`, password `admin`, DB `matchPoint` (see `src/main/resources/application.properties`).

## Architecture

### Backend (`src/main/`)

Hybrid **Scala + Java** project:

- **Java** (`src/main/java/models/`): Immutable models using Lombok `@Value @Builder @Jacksonized`. Split into `internal/` (DB-mapped) and `external/` (request DTOs). Enums defined here.
- **Scala** (`src/main/scala/com/matchPoint/`): All application logic.

**Spring Boot** manages DI/lifecycle. **Akka HTTP** handles HTTP. Entry point: `Application.scala` → Spring → `ApplicationConfiguration.scala` → Akka HTTP on port 8080.

**Layer structure:**
- `api/` — Akka HTTP routes per resource; all combined in `ApiRoutes` under `/api`.
- `services/` — Validation + business logic. Builds internal models from request DTOs, delegates to repos.
- `repositories/` — Raw SQL via `NamedParameterJdbcTemplate`. Extend `JdbcWrapperTrait` which provides `queryList`, `queryOption`, `querySingle` returning `Future[_]`. JDBC runs on a dedicated cached thread pool (non-blocking from Akka's perspective).
- `helpers/` — `JacksonSupport` (Akka HTTP marshalling), `JdbcWrapper`, `FlywayMigration`, `DatabaseConnection`.

### Critical Architecture Notes

**Two Jackson mappers — different behavior:**
- `JacksonSupport.scala` (Akka HTTP request/response): no snake_case, standard naming. Used for HTTP serialization.
- `ApplicationConfiguration.objectMapper()` (Spring bean, used by `JacksonRowMapper` in repos): uses `SNAKE_CASE` property naming + `WRITE_DATES_AS_TIMESTAMPS=false`. Used for DB row mapping.

**Dates:** `startDate`/`endDate` are stored and transported as epoch milliseconds (`Long`). `UpsertTournamentRequest` uses `Long`, not `Instant`. Frontend sends/receives epoch ms numbers, never ISO strings.

**Rating enum** (`models.player.internal.Rating`): serializes as a `float` via `@JsonValue` (e.g., `3.5`), deserializes via `@JsonCreator fromJson(double)`. When passing `Rating` to JDBC, use `Float.box(rating.value)` — passing the enum object directly causes a `PSQLException`.

**TournamentStatus enum**: `@JsonValue` is the lowercase string (`"pending"`, `"active"`, `"completed"`). The enum constant names are uppercase (`PENDING`, etc.) — use `TournamentStatus.valueOf(s.toUpperCase)` to parse from a query param string.

**Filter endpoint** (`POST /api/tournaments/filter`): accepts a JSON body deserialised as `FilterTournamentsRequest`. All fields are optional (no `@NonNull`). The service maps each field with `Option(request.getField)` — null becomes `None`, set values become `Some`. Frontend sends `POST` with a JSON body built from only the non-null filter fields.

**Validation timing differs by service:**
- `PlayerService.validate()` returns `Future[Unit]` — errors surface as `Future.failed(...)`. Tests use `.failed.futureValue`.
- `TournamentService.validate()` returns `Unit` and **throws synchronously** before any `Future` is created. Tests must use `intercept[IllegalArgumentException]`, not `.failed.futureValue`.
- `UserService.checkAvailability()` returns `Future[Unit]` — all errors (email taken, phone taken, invalid phone) surface as `Future.failed(IllegalArgumentException)`. Tests use `.failed.futureValue`.

**`onSuccess` with `Future[Unit]` does not compile in Akka HTTP** — use `onComplete` instead:
```scala
onComplete(service.checkAvailability(request)) {
  case scala.util.Success(_)  => complete(StatusCodes.OK)
  case scala.util.Failure(ex) => throw ex  // caught by handleExceptions
}
```

### Frontend (`frontend/src/`)

React 19 + TypeScript + Vite + Tailwind CSS + React Router v7. Vite proxies `/api/*` to `http://localhost:8080`.

**Model conventions:**
- `frontend/src/model/` holds shared TypeScript interfaces and constants.
- `Tournament.ts`: dates (`startDate`, `endDate`) and ratings (`minRating`, `maxRating`) are `number` (epoch ms and float respectively). Never use strings for these fields in form state.
- `RatingOptions.ts`: exports `RATING_OPTIONS` as `number[]` matching `Rating` float values.
- Form state uses `Omit<Tournament, 'id'>` inline — do not create named type aliases inside page files.
- Date inputs (`datetime-local`) store epoch ms in state; display by converting: `new Date(epochMs).toISOString().slice(0, 16)`. Validate with `isNaN()` not falsy checks (`0.0` is a valid rating but falsy).

### Database

PostgreSQL + Flyway. Migrations in `src/main/resources/migrations/` grouped by `YYYY.MM/`. Naming: `V{timestamp}__{description}.sql` (e.g., `V20260303120000__ratings_to_numeric.sql`).

Key tables: `player`, `tournament`. `organizer_ids` stored as JSONB array. Ratings stored as `numeric`/`float`. Dates stored as `bigint` (epoch ms).

### Testing

Tests in `src/test/scala/`. ScalaTest (`AnyFlatSpec`) + Mockito (`mockito-core`).

**Do not use `MockitoSugar`** — `scalatestplus:mockito-*` is not in the build. Use `Mockito.mock(classOf[T])` directly:
```scala
import org.mockito.Mockito
val repo = Mockito.mock(classOf[TournamentRepository])
```

Use `ArgumentCaptor.forClass(classOf[T])` (not the generic version) for the same reason.

For capturing `Option[T]` arguments, cast the captor to the concrete type so `.capture()` satisfies the method signature:
```scala
val captor = ArgumentCaptor.forClass(classOf[Option[_]]).asInstanceOf[ArgumentCaptor[Option[String]]]
```

Use `BeforeAndAfterEach` + `Mockito.reset(repo)` to isolate mock state between tests:
```scala
class MySpec extends AnyFlatSpec with BeforeAndAfterEach {
  private val repo = Mockito.mock(classOf[MyRepository])
  override def beforeEach(): Unit = Mockito.reset(repo)
}
```

**Akka HTTP query parameter UUID gotcha:** `parameter("foo".as[java.util.UUID])` does **not** compile — Akka HTTP has no built-in `Unmarshaller[String, UUID]`. Always use `parameter("foo")` (String) and call `java.util.UUID.fromString(str)` manually. `ApiExceptionHandler` already maps `IllegalArgumentException` → 400, so invalid UUIDs are handled gracefully.

**Player lookup by userId:** `GET /api/players?userId=<uuid>` returns the player for that user (or 404). Use this from the frontend when only the session user ID is available (e.g., settings page). The session stores `{ id, firstName, lastName, token }` where `id` is the **user** UUID, not the player UUID.

**Registration flow** (`/register` → `RegisterPage.tsx`) is 2-step:
- Step 1: collects account details, validates locally, then calls `POST /api/users/check` to verify email/phone availability — no user is created yet. Errors appear on step 1 immediately.
- Step 2: on final submit, calls `POST /api/users` → `POST /api/users/login` → `setUser()` → `POST /api/players` → navigate to `/players/:id`. If user creation fails (e.g. race condition on email), error is shown on step 1 via `setUserErrors({ form: msg })` + `setStep(1)`.
- The Back button is safe: no DB records exist until step 2 is submitted.

### Frontend (`frontend/src/`)

**Player settings page** (`/settings` → `PlayerSettingsPage.tsx`):
- Requires an authenticated session; redirects to `/login` if none.
- On mount: fetches `GET /api/players?userId={user.id}` to load the existing player profile.
- Pre-fills the form if a player exists; shows an informational notice if not (first-time setup).
- Saves via `POST /api/players` (upsert) — sends the existing `player.id` when updating, omits it when creating.
- The profile name in the navbar (`MainPage.tsx`) is a `<Link to="/settings">` when logged in.

**Tournament list / filter page** (`/tournaments` → `TournamentListPage.tsx`):
- Filters persisted in `sessionStorage` under key `"tournamentFilters"` — restored on mount.
- On mount, `runSearch(loadFilters())` fires automatically so the list populates without clicking Search.
- Filter state uses `Filters` interface from `frontend/src/model/tournament/Filters.ts` (all fields nullable except `offset`/`limit`).
- `runSearch(f: Filters)` accepts filters as a parameter (not from state closure) to allow calling from `useEffect` and `handleReset` without stale-closure issues.

## PR Descriptions

Structure: title (`MP-XX: short description`), then sections: **Problem**, **Solution**, optionally grouped sub-sections (Backend / Frontend / Tests), and **Before / After**.

- Use bullet lists throughout — no tables
- Before / After items follow the pattern: `- <scenario>: was <old behaviour>, now <new behaviour>`
- Keep it concise: one sentence per bullet, no filler words
