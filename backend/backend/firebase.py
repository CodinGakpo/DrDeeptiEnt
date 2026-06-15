import os
from django.conf import settings
import firebase_admin
from firebase_admin import credentials, auth
import json

def initialize_firebase():
    if firebase_admin._apps:
        return

    cert_path = getattr(settings, "FIREBASE_SERVICE_ACCOUNT_PATH", None)
    if cert_path and os.path.exists(cert_path):
        cred = credentials.Certificate(cert_path)
    else:
        # Check if the credentials are provided as a JSON string in env var
        cert_json = getattr(settings, "FIREBASE_CREDENTIALS", None)
        if cert_json:
            try:
                cert_dict = json.loads(cert_json)
                cred = credentials.Certificate(cert_dict)
            except json.JSONDecodeError:
                cred = credentials.ApplicationDefault()
        else:
            cred = credentials.ApplicationDefault()
    
    firebase_admin.initialize_app(cred)

def verify_firebase_token(token):
    initialize_firebase()
    try:
        decoded_token = auth.verify_id_token(token)
        return decoded_token
    except Exception as e:
        raise ValueError(f"Invalid Firebase Token: {str(e)}")
