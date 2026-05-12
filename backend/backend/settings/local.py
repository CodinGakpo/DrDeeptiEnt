from .base import *

DEBUG = True
ALLOWED_HOSTS = ALLOWED_HOSTS or ["localhost", "127.0.0.1"]

# Local safety fallback: use SQLite only when PGHOST/PGDATABASE are not set.
if not DATABASES["default"].get("HOST") or not DATABASES["default"].get("NAME"):
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.sqlite3",
            "NAME": BASE_DIR / "db.sqlite3",
        }
    }
