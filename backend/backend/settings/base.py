import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent.parent


def load_env_file(path):
    if not path.exists():
        return

    for raw_line in path.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue

        key, value = line.split("=", 1)
        os.environ.setdefault(key.strip(), value.strip().strip('"').strip("'"))


def env(key, default=None, cast=None):
    value = os.getenv(key, default)
    if cast is bool:
        return str(value).strip().lower() in {"1", "true", "yes", "on"}
    if cast is list:
        return [item.strip() for item in str(value or "").split(",") if item.strip()]
    if cast:
        return cast(value)
    return value


def env_first(keys, default=""):
    for key in keys:
        value = env(key)
        if value not in (None, ""):
            return str(value).strip().strip('"').strip("'")
    return default


load_env_file(BASE_DIR / ".env")

# ENV
ENV = env("ENV", default="local")

# SECURITY
SECRET_KEY = env("SECRET_KEY", default="local-dev-secret-key")
DEBUG = env("DEBUG", default=True, cast=bool)
ALLOWED_HOSTS = env("ALLOWED_HOSTS", default="localhost,127.0.0.1", cast=list)

# HTTPS / SECURITY HEADERS
SESSION_COOKIE_SECURE = not DEBUG
CSRF_COOKIE_SECURE = not DEBUG
SECURE_SSL_REDIRECT = not DEBUG
SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")

SECURE_HSTS_SECONDS = 31536000 if not DEBUG else 0
SECURE_HSTS_INCLUDE_SUBDOMAINS = not DEBUG
SECURE_HSTS_PRELOAD = not DEBUG

# APPS
INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "rest_framework",
    "corsheaders",
    "accounts",
    "clinic",
    "appointments",
]

# MIDDLEWARE
MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

# CORS
CORS_ALLOWED_ORIGINS = env(
    "CORS_ALLOWED_ORIGINS",
    default="http://localhost:5173,https://drdeeptientdelhi.in,https://www.drdeeptientdelhi.in",
    cast=list,
)
CORS_ALLOWED_ORIGIN_REGEXES = env(
    "CORS_ALLOWED_ORIGIN_REGEXES",
    default=r"^https:\/\/.*\.vercel\.app$",
    cast=list,
)
CORS_ALLOW_CREDENTIALS = True

# CSRF
CSRF_TRUSTED_ORIGINS = env(
    "CSRF_TRUSTED_ORIGINS",
    default="http://localhost:5173,https://drdeeptientdelhi.in,https://www.drdeeptientdelhi.in",
    cast=list,
)

# URLS
ROOT_URLCONF = "backend.urls"
APPEND_SLASH = True

# REST FRAMEWORK
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework.authentication.SessionAuthentication",
    ],
    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.AllowAny",
    ],
    "DEFAULT_RENDERER_CLASSES": [
        "rest_framework.renderers.JSONRenderer",
    ],
}

# TEMPLATES
TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "backend.wsgi.application"

# DATABASE (Neon / Postgres)
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "HOST": env("PGHOST", default=""),
        "NAME": env("PGDATABASE", default=""),
        "USER": env("PGUSER", default=""),
        "PASSWORD": env("PGPASSWORD", default=""),
        "PORT": env("PGPORT", default="5432"),
        "OPTIONS": {
            "sslmode": env("PGSSLMODE", default="require"),
            "channel_binding": env("PGCHANNELBINDING", default="require"),
        },
    }
}

# AUTH
AUTH_USER_MODEL = "accounts.User"

# DOCTOR ACCESS
DOCTOR_ACCESS_USERNAME = env_first(["DOCTOR_ACCESS_USERNAME", "username"], default="")
DOCTOR_ACCESS_PASSWORD = env_first(["DOCTOR_ACCESS_PASSWORD", "password"], default="")

# TIME
LANGUAGE_CODE = "en-us"
TIME_ZONE = "Asia/Kolkata"
USE_I18N = True
USE_TZ = True

# STATIC FILES
STATIC_URL = "/static/"
STATIC_ROOT = os.path.join(BASE_DIR, "staticfiles")

# LOGGING
LOGGING = {
    "version": 1,
    "handlers": {
        "console": {
            "class": "logging.StreamHandler",
        },
    },
    "root": {
        "handlers": ["console"],
        "level": "INFO",
    },
}
