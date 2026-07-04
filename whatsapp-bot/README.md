# WhatsApp Bot

This is a rule-based WhatsApp bot for Dr. Deepti Sinha's ENT clinic, built with FastAPI and the Meta WhatsApp Business Cloud API.

## Setup

1. **Environment Variables**: Create a `.env` file from the credentials provided in `backend/.env` and Meta Developer dashboard. See `.env.example` format in the implementation plan.
2. **Install Dependencies**:
   ```powershell
   python -m venv venv
   .\venv\Scripts\activate
   pip install -r requirements.txt
   ```
3. **Database Setup**:
   The bot uses Alembic to manage its schema in the same Neon PostgreSQL database as the Django backend.
   ```powershell
   alembic upgrade head
   ```

## Running

```powershell
uvicorn main:app --port 8001 --reload
```

Then, use a tool like `ngrok` to expose port 8001 to the internet, and configure your Meta WhatsApp webhook to point to `https://<ngrok-id>.ngrok-free.app/whatsapp/webhook`.
Make sure to set the Verify Token in the Meta dashboard to the same value as `WHATSAPP_VERIFY_TOKEN` in `.env`.

## Menu Configuration

The menu tree is defined in `nodes.json`. Editing this file updates the bot's behavior without changing the code.
