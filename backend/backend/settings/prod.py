from .base import *

DEBUG = False
if not ALLOWED_HOSTS:
    ALLOWED_HOSTS = ["drdeeptientdelhi.in", "www.drdeeptientdelhi.in"]

if ".onrender.com" not in ALLOWED_HOSTS:
    ALLOWED_HOSTS.append(".onrender.com")

# Insert WhiteNoise right after SecurityMiddleware (which is at index 1 in base.py)
MIDDLEWARE.insert(2, "whitenoise.middleware.WhiteNoiseMiddleware")

# Configure static files storage for production
STATICFILES_STORAGE = "whitenoise.storage.CompressedManifestStaticFilesStorage"

# Cross-Domain Cookies
SESSION_COOKIE_SAMESITE = "None"
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SAMESITE = "None"
CSRF_COOKIE_SECURE = True
