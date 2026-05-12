from .base import *

DEBUG = False
ALLOWED_HOSTS = ALLOWED_HOSTS or ["drdeeptientdelhi.in", "www.drdeeptientdelhi.in", ".onrender.com"]

# Insert WhiteNoise right after SecurityMiddleware (which is at index 1 in base.py)
MIDDLEWARE.insert(2, "whitenoise.middleware.WhiteNoiseMiddleware")

# Configure static files storage for production
STATICFILES_STORAGE = "whitenoise.storage.CompressedManifestStaticFilesStorage"
