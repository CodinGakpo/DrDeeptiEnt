# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository overview

This repo is three independently deployed projects for Dr. Deepti Sinha's ENT clinic (drdeeptientdelhi.in), sharing one Neon Postgres database:

- **`backend/`** — Django REST API (appointments, doctor auth, clinic data). Deployed to Render (see `render.yaml`, `backend/build.sh`) and/or an EC2 host via SSH (`.github/workflows/deploy-backend.yaml`, currently deleted locally — check `git status`/`git log` before assuming which target is live).
- **`frontend/`** — React 19 + Vite SPA (public clinic site + booking flow + doctor portal). Deployed to Vercel (`frontend/vercel.json`).
- **`whatsapp-bot/`** — FastAPI WhatsApp chatbot for lead capture/booking, deployed as an AWS Lambda behind API Gateway via AWS SAM (`template.yaml` at repo root), with a Render fallback also configured (`render.yaml` targets `whatsapp-bot/start.sh`).

There is no top-level build tool tying these together — treat each directory as its own project root for commands.

## Commands

### backend/ (Django)

```powershell
cd backend
python -m venv venv; .\venv\Scripts\activate    # if venv/ doesn't already exist at repo root
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver                       # local dev server
python manage.py test                            # run all tests
python manage.py test appointments.tests         # single app's tests
python manage.py collectstatic --no-input        # prod static files (whitenoise)
```

Settings are selected via `ENV` env var: `backend/backend/settings/__init__.py` imports `prod.py` when `ENV=prod`/`production`, otherwise `local.py` (both extend `base.py`). Locally, if `PGHOST`/`PGDATABASE` aren't set, `local.py` falls back to SQLite (`db.sqlite3`). `base.py` also hand-parses a `.env` file at the repo root of `backend/` (not python-dotenv) and accepts either `NEON_CONNECTION_STRING` or `DATABASE_URL`/`PG*` vars.

### frontend/ (React + Vite)

```powershell
cd frontend
npm install
npm run dev        # Vite dev server
npm run build      # production build to dist/
npm run lint       # ESLint
npm run preview    # preview a production build
```

No test runner is configured.

### whatsapp-bot/ (FastAPI on Lambda)

```powershell
cd whatsapp-bot
python -m venv venv; .\venv\Scripts\activate
pip install -r requirements.txt
alembic upgrade head                             # applies to the SAME Neon DB as backend/
uvicorn main:app --port 8001 --reload            # local dev; expose via ngrok for Meta webhook testing
```

Deploying to AWS Lambda from the repo root (SAM template covers the whole repo, `CodeUri: whatsapp-bot/`):

```powershell
python generate_samconfig.py   # regenerates samconfig.toml (gitignored) from whatsapp-bot/.env — never hand-edit samconfig.toml
.\build.ps1                    # sam build && sam deploy
# or directly:
python deploy.py               # sam deploy with --parameter-overrides pulled from whatsapp-bot/.env
```

Secrets (`WHATSAPP_*`, `META_APP_SECRET`, `STAFF_WHATSAPP_NUMBER`, `NEON_CONNECTION_STRING`) are passed as CloudFormation `NoEcho` parameters at deploy time and injected as Lambda env vars — they are never committed. `samconfig.toml` and `.aws-sam/` are gitignored for this reason; regenerate rather than edit.

Alembic migrations: `whatsapp-bot/alembic.ini` points `script_location` at `whatsapp-bot/migrations`; new migrations go in `whatsapp-bot/migrations/versions`.

## Architecture

### whatsapp-bot: node-graph conversation engine

The chatbot has no NLP — it's a declarative state machine driven entirely by `whatsapp-bot/nodes.json`. Editing that file changes bot behavior with no code changes.

- **`main.py`** — single FastAPI webhook (`/whatsapp/webhook` GET for Meta verification, POST for messages). Verifies `X-Hub-Signature-256` via HMAC-SHA256 against `META_APP_SECRET` on every POST. Parses the incoming message (text or interactive button/list reply), resolves it against the current node's `options`, updates session state, and calls `graph.render_node`. Wrapped for Lambda via `Mangum(app, lifespan="off")` as the `handler` export.
- **`graph.py`** — loads `nodes.json` once at import time. Each node has a `message` template (`{field|default}` placeholders filled from session context via `format_message`), `options`, and a `render_as` hint (`buttons` ≤3 items, `list` ≤10 items — WhatsApp API hard limits enforced in `whatsapp.py`). `collect_time` is special-cased in `get_dynamic_options` to generate the next 3 non-Sunday days' morning/afternoon slots at request time rather than being static in `nodes.json`.
- **`session.py`** — a `node_stack` (list) + `current_node` per phone number implement Back/Main-menu navigation; `context` accumulates collected fields (name, age, concern, location, preferred_time) as the user progresses. Reset keywords (`hi`, `menu`, `start`, `restart`) always jump to `root`.
- **`leads.py`** — a node with `"action": "save_lead_and_notify_staff"` triggers `save_lead` (writes `WhatsAppLead`) then `notify_staff`, which sends a pre-approved WhatsApp **template** message (not free text) to the staff number, because free-form messages can only be sent within WhatsApp's 24-hour customer-service window and staff have never messaged the bot.
- **`models.py`** — `ConversationSession` (phone number PK, `node_stack`/`context` as JSONB) and `WhatsAppLead`, both in the same Neon Postgres instance the Django backend uses — this is a separate schema/tables, not a separate database.
- **`db.py`** — async SQLAlchemy + asyncpg. Notably strips any `?query=params` from the connection string and passes `ssl=require` via `connect_args` instead, because asyncpg (unlike psycopg2) rejects `sslmode=` in the URL. Pool is deliberately small (`pool_size=2, max_overflow=3`) since Lambda spins up many concurrent execution environments against Neon's connection cap.

When touching WhatsApp integration code, keep in mind two Meta-specific gotchas documented in `PROJECT_STORY.md`: a Meta account can have multiple WhatsApp Business Accounts (WABAs), and the dashboard's "Verify and save" only confirms the webhook handshake — it does **not** subscribe a WABA to receive message events (that requires `POST /{waba_id}/subscribed_apps` via the Graph API separately).

### backend: Django REST API

- Apps: `accounts` (custom `User` with `phone_number` + `is_doctor`), `clinic` (`DoctorProfile`, `AvailabilitySlot`, `TimeSlot` — booking a slot cascades to auto-generated 15-minute `TimeSlot`s via `AvailabilitySlot.save()`/`generate_time_slots`), `appointments` (OTP-gated booking flow).
- OTP delivery (`appointments/otp_delivery.py`) abstracts SMS/WhatsApp OTP providers behind `settings.OTP_PROVIDER`, normalizing Indian numbers to `91XXXXXXXXXX` for Twilio.
- `SearchRobotsTagMiddleware` (`backend/middleware.py`) adds `X-Robots-Tag: noindex` to all `/api/` and `/admin/` responses.
- CORS/CSRF trusted origins default to the production domain, localhost:5173, and any `*.vercel.app` preview deployment (via `CORS_ALLOWED_ORIGIN_REGEXES`).

### frontend: React SPA

Routes are defined in `src/routes.jsx`. API calls go through `src/api/*.js` (thin wrappers) and `src/utils/api.js`; `src/hooks/useBooking.js` drives the appointment booking UI (`pages/BookAppointment.jsx`, `components/SlotGrid.jsx`). `src/utils/firebase.js` + `firebase` package back the doctor-portal auth path (`pages/DoctorAccess.jsx`). SEO metadata/schema.org structured data lives in `src/seo/`.
