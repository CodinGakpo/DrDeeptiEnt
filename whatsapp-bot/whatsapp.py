import os
import httpx
from dotenv import load_dotenv

load_dotenv()

WHATSAPP_PHONE_NUMBER_ID = os.environ.get("WHATSAPP_PHONE_NUMBER_ID")
WHATSAPP_ACCESS_TOKEN = os.environ.get("WHATSAPP_ACCESS_TOKEN")

BASE_URL = f"https://graph.facebook.com/v19.0/{WHATSAPP_PHONE_NUMBER_ID}/messages"

async def _send_message(payload: dict):
    headers = {
        "Authorization": f"Bearer {WHATSAPP_ACCESS_TOKEN}",
        "Content-Type": "application/json"
    }
    async with httpx.AsyncClient() as client:
        response = await client.post(BASE_URL, json=payload, headers=headers)
        if response.status_code != 200:
            print(f"WHATSAPP API ERROR: {response.text}")
        response.raise_for_status()
        return response.json()

async def send_text(to: str, body: str):
    payload = {
        "messaging_product": "whatsapp",
        "recipient_type": "individual",
        "to": to,
        "type": "text",
        "text": {"preview_url": False, "body": body}
    }
    return await _send_message(payload)

async def send_buttons(to: str, body: str, buttons: list):
    """
    buttons should be a list of dicts: [{"id": "...", "title": "..."}, ...]
    Maximum 3 buttons.
    """
    if len(buttons) > 3:
        raise ValueError("Cannot send more than 3 buttons.")
    
    action_buttons = []
    for btn in buttons:
        action_buttons.append({
            "type": "reply",
            "reply": {
                "id": btn["id"],
                "title": btn["title"][:20]
            }
        })
        
    payload = {
        "messaging_product": "whatsapp",
        "recipient_type": "individual",
        "to": to,
        "type": "interactive",
        "interactive": {
            "type": "button",
            "body": {"text": body},
            "action": {"buttons": action_buttons}
        }
    }
    return await _send_message(payload)

async def send_list(to: str, body: str, rows: list):
    """
    rows should be a list of dicts: [{"id": "...", "title": "..."}, ...]
    Maximum 10 rows.
    """
    if len(rows) > 10:
        raise ValueError("Cannot send more than 10 rows in a list.")
        
    action_rows = []
    for row in rows:
        action_rows.append({
            "id": row["id"],
            "title": row["title"][:24]
        })
        
    payload = {
        "messaging_product": "whatsapp",
        "recipient_type": "individual",
        "to": to,
        "type": "interactive",
        "interactive": {
            "type": "list",
            "body": {"text": body},
            "action": {
                "button": "Options",
                "sections": [{"title": "Select an option", "rows": action_rows}]
            }
        }
    }
    return await _send_message(payload)

async def send_template(to: str, template_name: str, language_code: str = "en_US", variables: list = None):
    """
    Send an approved WhatsApp template.
    variables should be a list of strings corresponding to {{1}}, {{2}}, etc.
    """
    components = []
    if variables:
        parameters = [{"type": "text", "text": str(v)} for v in variables]
        components.append({
            "type": "body",
            "parameters": parameters
        })
        
    payload = {
        "messaging_product": "whatsapp",
        "to": to,
        "type": "template",
        "template": {
            "name": template_name,
            "language": {
                "code": language_code
            },
            "components": components
        }
    }
    return await _send_message(payload)
