import os

_env = os.getenv("ENV", "local").strip().lower()

if _env in {"prod", "production"}:
    from .prod import *
else:
    from .local import *
