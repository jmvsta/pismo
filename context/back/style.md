# Backend conventions

Stack: Kotlin, Spring Boot, spring-graphql, jOOQ, Flyway, PostgreSQL.

## Code

- SOLID. Favor an interface + a single implementation class per service and
  per repository (e.g. `UserService` / `UserServiceImpl`,
  `UserRepository` / `JooqUserRepository`) so dependents depend on the
  abstraction, not the implementation.
- KISS. Reach for a design pattern when it genuinely earns its keep for the
  problem at hand — not by default, and not to look more "enterprise."
- No comments in code. Names should make the comment unnecessary.
- No enormous methods. If a method is doing more than one distinct thing,
  split it.
- No tests. Don't write unit/integration tests for implemented tasks.

## Layout

- Package by domain (vertical slice), not by layer:
  `com.jvmvstv_v.back.<domain>.{resolver,service,repository,model}` — e.g.
  `com.jvmvstv_v.back.user`, `com.jvmvstv_v.back.questionnaire`. Matches how
  the Flyway migrations are already split (V001 core_identity, V002
  questionnaire, V003 matching_and_pen_pals, V004 letters, V005 forum, V006
  badges, V007 wallet_and_billing).
- One `.graphqls` schema file per domain under `src/main/resources/graphql/`
  (spring-graphql merges them automatically).
- jOOQ: no codegen is wired up yet and no datasource is configured. Until
  that's set up, write DSL by hand against manually declared table/field
  constants that match the Flyway schema exactly — check the relevant
  migration file before writing a query rather than guessing column names.

## Verification

`./gradlew build -x test` (run from `/back`) must pass clean before a task
is considered done. Tests are skipped deliberately — the existing
`BackApplicationTests` context-load test needs a live Postgres datasource
that isn't configured, so a full `build` fails for reasons unrelated to the
code being written.
