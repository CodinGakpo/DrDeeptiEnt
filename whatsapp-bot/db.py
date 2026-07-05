import os
from pathlib import Path
from dotenv import load_dotenv
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession

BASE_DIR = Path(__file__).resolve().parent

# Load environment variables from local .env (dev only — Lambda uses native env vars)
load_dotenv(BASE_DIR / ".env")
load_dotenv(BASE_DIR.parent / "backend" / ".env")

PGHOST = os.environ.get("PGHOST", "")
PGDATABASE = os.environ.get("PGDATABASE", "")
PGUSER = os.environ.get("PGUSER", "")
PGPASSWORD = os.environ.get("PGPASSWORD", "")
PGPORT = os.environ.get("PGPORT", "5432")

# Prefer an explicit NEON_CONNECTION_STRING or DATABASE_URL
DATABASE_URL = os.environ.get("NEON_CONNECTION_STRING") or os.environ.get("DATABASE_URL")

if DATABASE_URL:
    # SQLAlchemy requires postgresql+asyncpg:// but Neon provides postgresql://
    if DATABASE_URL.startswith("postgresql://"):
        DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://", 1)
else:
    # Fallback to constructing one from the individual PG* variables.
    DATABASE_URL = f"postgresql+asyncpg://{PGUSER}:{PGPASSWORD}@{PGHOST}:{PGPORT}/{PGDATABASE}"

# Ensure SSL is required for Neon
if "neon.tech" in DATABASE_URL or "neon.tech" in PGHOST:
    if "?" not in DATABASE_URL:
        DATABASE_URL += "?ssl=require"
    elif "ssl=" not in DATABASE_URL and "sslmode=" not in DATABASE_URL:
        DATABASE_URL += "&ssl=require"

# Lambda spins up many concurrent instances; keep the pool small to avoid
# exhausting Neon's connection limit. pool_pre_ping drops stale connections
# that were recycled across Lambda invocations.
engine = create_async_engine(
    DATABASE_URL,
    echo=False,
    pool_size=2,
    max_overflow=3,
    pool_pre_ping=True,
)
AsyncSessionLocal = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

async def get_db():
    async with AsyncSessionLocal() as session:
        yield session
