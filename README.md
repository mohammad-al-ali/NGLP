# NGLP

NGLP is a Next Generation Learning Platform with a Spring Boot backend, a React/Vite frontend, and an optional Python transcription microservice. The app supports course browsing, student dashboards, lesson playback, teacher course creation, admin management, enrollments, transcripts, and an AI tutor flow.

## Project Structure

- `backend.v1/` - Spring Boot API for users, roles, categories, courses, lessons, enrollments, transcripts, uploads, and AI tutor messages.
- `frontend.v1/` - React/Vite frontend with routed student, teacher, admin, catalog, auth, and study-room screens.
- `extract_transcription_microservice/` - Optional FastAPI service that uses Whisper to turn uploaded lesson videos into timestamped transcript text.
- `NGLP.postman_collection.json` - Postman collection for API testing.

## Local Requirements

- Java 20 for the current backend configuration.
- Node.js 20 or newer for the frontend toolchain.
- Maven wrapper included under `backend.v1/`.
- Python 3.10+ only if you want to run the optional transcription service.

The backend currently defaults to an H2 file database, so MySQL is not required for local development.

## Run The Backend

```bash
cd backend.v1
sh mvnw spring-boot:run
```

The backend starts on `http://localhost:8080` and exposes APIs under:

```text
http://localhost:8080/api/v1
```

Local data is stored under `backend.v1/data/`, and uploaded videos are stored under `backend.v1/uploads/videos/`. Both are ignored by Git.

## Run The Frontend

```bash
cd frontend.v1
npm install
npm run dev -- --host 127.0.0.1
```

Open the Vite URL shown in the terminal, usually:

```text
http://127.0.0.1:5173
```

The frontend API base URL defaults to:

```text
http://localhost:8080/api/v1
```

You can override it with `VITE_API_BASE_URL` if needed.

## Optional Transcription Service

The transcription service is only needed if you want uploaded lesson videos to be converted into transcript segments locally.

```bash
cd extract_transcription_microservice
python -m pip install fastapi uvicorn faster-whisper python-multipart
python -m uvicorn server:app --port 8000
```

It exposes:

```text
POST http://127.0.0.1:8000/transcribe
```

This service is separate from the AI tutor. Whisper handles speech-to-text; the AI tutor handles chat responses.

## AI Tutor Notes

The backend currently uses Spring AI's OpenAI starter. Local startup uses a dummy `OPENAI_API_KEY`, so the app can run, but real AI responses require either:

- a real `OPENAI_API_KEY`, or
- swapping Spring AI from OpenAI to a local provider such as Ollama.

For a local model route, install Ollama, pull a chat model such as `llama3.1:8b` or `qwen2.5:7b`, then replace the Spring AI OpenAI starter with the Ollama starter and configure `spring.ai.ollama.*` properties.

## Useful Commands

Run frontend checks:

```bash
npm --prefix frontend.v1 run lint
npm --prefix frontend.v1 run build
```

Run backend tests:

```bash
cd backend.v1
sh mvnw test
```

Run the same validation used during integration:

```bash
npm --prefix frontend.v1 run lint && npm --prefix frontend.v1 run build && cd backend.v1 && sh mvnw test
```

## Current Local Readiness

The project is ready for local development and demos:

- Frontend routes and screens are implemented.
- Frontend calls are wired to backend `/api/v1` endpoints.
- Backend has local H2 defaults and no longer requires MySQL to start locally.
- Auth, enrollments, transcripts, file uploads, role seeding, and admin/user support are present.
- Production-only items are listed below and are not blockers for local/demo use.

## Production Notes

Before a real production deployment, decide or implement the following:

- Use real JWT auth and request filters instead of the current lightweight login token.
- Restrict admin and teacher endpoints by role.
- Configure production database credentials with `SPRING_DATASOURCE_URL`, `SPRING_DATASOURCE_USERNAME`, and `SPRING_DATASOURCE_PASSWORD`.
- Configure a real AI provider, either hosted OpenAI or a local model provider such as Ollama.
- Decide where uploaded videos should live in production, such as local disk, object storage, or a media service.
- Add formal API tests around auth, enrollments, lesson uploads, transcripts, and admin actions.
- Refresh `backend.v1/src/API.md` so it matches the live `/api/v1` routes.
