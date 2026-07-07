#!/usr/bin/env bash
# Exit on error
set -e

# Run database migrations
alembic upgrade head

# Start the FastAPI application with Uvicorn worker
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker -b 0.0.0.0:$PORT
