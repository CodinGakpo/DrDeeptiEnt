import base64
import urllib.parse
import urllib.request

from django.conf import settings


class OTPDeliveryError(Exception):
    pass


def _normalize_indian_whatsapp_phone(phone_number):
    digits = "".join(char for char in str(phone_number) if char.isdigit())
    if len(digits) == 10:
        digits = f"91{digits}"
    return digits


def _send_twilio_sms(phone_number, message):
    account_sid = getattr(settings, "TWILIO_ACCOUNT_SID", "")
    auth_token = getattr(settings, "TWILIO_AUTH_TOKEN", "")
    from_number = getattr(settings, "TWILIO_SMS_FROM", "")

    if not account_sid or not auth_token or not from_number:
        raise OTPDeliveryError("Twilio SMS is not configured")

    payload = urllib.parse.urlencode(
        {
            "To": f"+{_normalize_indian_whatsapp_phone(phone_number)}",
            "From": from_number,
            "Body": message,
        }
    ).encode("utf-8")

    request = urllib.request.Request(
        url=f"https://api.twilio.com/2010-04-01/Accounts/{account_sid}/Messages.json",
        data=payload,
        method="POST",
    )

    auth = base64.b64encode(f"{account_sid}:{auth_token}".encode("utf-8")).decode("utf-8")
    request.add_header("Authorization", f"Basic {auth}")
    request.add_header("Content-Type", "application/x-www-form-urlencoded")

    try:
        with urllib.request.urlopen(request, timeout=15):
            return
    except Exception as exc:
        raise OTPDeliveryError("Failed to send OTP via Twilio SMS") from exc


def _send_twilio_whatsapp(phone_number, message):
    account_sid = getattr(settings, "TWILIO_ACCOUNT_SID", "")
    auth_token = getattr(settings, "TWILIO_AUTH_TOKEN", "")
    from_number = getattr(settings, "TWILIO_WHATSAPP_FROM", "")

    if not account_sid or not auth_token or not from_number:
        raise OTPDeliveryError("Twilio WhatsApp is not configured")

    payload = urllib.parse.urlencode(
        {
            "To": f"whatsapp:+{_normalize_indian_whatsapp_phone(phone_number)}",
            "From": from_number,
            "Body": message,
        }
    ).encode("utf-8")

    request = urllib.request.Request(
        url=f"https://api.twilio.com/2010-04-01/Accounts/{account_sid}/Messages.json",
        data=payload,
        method="POST",
    )

    auth = base64.b64encode(f"{account_sid}:{auth_token}".encode("utf-8")).decode("utf-8")
    request.add_header("Authorization", f"Basic {auth}")
    request.add_header("Content-Type", "application/x-www-form-urlencoded")

    try:
        with urllib.request.urlopen(request, timeout=15):
            return
    except Exception as exc:
        raise OTPDeliveryError("Failed to send OTP via Twilio WhatsApp") from exc


def send_otp(phone_number, otp):
    provider = str(getattr(settings, "OTP_PROVIDER", "console")).strip().lower()
    message = f"Your Dr Deepti ENT verification code is {otp}. It is valid for one login attempt."

    if provider == "twilio_whatsapp":
        _send_twilio_whatsapp(phone_number, message)
        return "whatsapp"

    if provider == "twilio_sms":
        _send_twilio_sms(phone_number, message)
        return "sms"

    # Fallback / local mode
    print("DEV OTP:", otp)
    return "console"
