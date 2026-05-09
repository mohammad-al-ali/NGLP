# NGLP Production Readiness TODOs

These are the remaining items that are not blockers for local/demo use, but should be handled before a real production deployment.

## Environment Decisions

- Decide whether the project standard is Java 20 or Java 21. The local workspace has Java 20, so `backend.v1/pom.xml` targets Java 20. If production uses Java 21, install JDK 21 and change `java.version` back to `21`.
- Configure production database environment variables: `SPRING_DATASOURCE_URL`, `SPRING_DATASOURCE_USERNAME`, and `SPRING_DATASOURCE_PASSWORD`. The repo now defaults to local H2 so the app can run immediately.
- Set a real `OPENAI_API_KEY` for AI tutor responses. The local default is only a startup placeholder.

## Security Hardening

- Replace the current lightweight login token with real JWT signing and request authentication filters.
- Restrict admin endpoints (`/api/v1/users`, `/api/v1/users/{id}/admin`, category management) to `ROLE_ADMIN`.
- Restrict teacher course creation/update endpoints to `ROLE_TEACHER` or `ROLE_ADMIN`.
- Add server-side validation for all create/update DTOs.

## External Services

- Run and monitor the transcription microservice at `http://127.0.0.1:8000/transcribe`, or move that URL into configuration.
- Decide where videos should live in production: local disk, S3-compatible storage, or another media service. The current `FileStorageService` stores files under `backend.v1/uploads/videos`.

## Product Completeness

- Replace the frontend's local fallback sample data with stricter production loading/error states after backend seed data exists.
- Add a real current-user endpoint based on auth token rather than the current `GET /api/v1/auth/me?userId=...` helper.
- Add formal tests for auth, enrollments, lesson upload, category nesting, admin user updates, and study room transcript loading.
- Refresh `backend.v1/src/API.md`; it still documents older `/api/...` paths while the live controllers use `/api/v1/...`.
