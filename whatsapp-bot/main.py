import os
from mangum import Mangum
import hmac
import hashlib
from fastapi import FastAPI, Request, HTTPException, Depends, Response
from sqlalchemy.ext.asyncio import AsyncSession
from dotenv import load_dotenv

import graph
import session
import leads
from db import get_db

load_dotenv()

app = FastAPI()

WHATSAPP_VERIFY_TOKEN = os.environ.get("WHATSAPP_VERIFY_TOKEN")
META_APP_SECRET = os.environ.get("META_APP_SECRET")

async def verify_signature(request: Request):
    signature = request.headers.get("X-Hub-Signature-256")
    if not signature:
        raise HTTPException(status_code=403, detail="Missing signature")
        
    body = await request.body()
    expected_hash = hmac.new(
        META_APP_SECRET.encode(),
        body,
        hashlib.sha256
    ).hexdigest()
    
    expected_signature = f"sha256={expected_hash}"
    if not hmac.compare_digest(signature, expected_signature):
        raise HTTPException(status_code=403, detail="Invalid signature")

@app.get("/whatsapp/webhook")
async def verify_webhook(request: Request):
    mode = request.query_params.get("hub.mode")
    token = request.query_params.get("hub.verify_token")
    challenge = request.query_params.get("hub.challenge")
    
    if mode == "subscribe" and token == WHATSAPP_VERIFY_TOKEN:
        return Response(content=challenge, media_type="text/plain")
    
    raise HTTPException(status_code=403, detail="Verification failed")

@app.get("/privacy")
async def privacy_policy():
    return Response(content="Privacy Policy: This app is for testing purposes.", media_type="text/plain")

def validate_input(value: str, rule: str) -> bool:
    if not rule:
        return True
    
    if "non_empty" in rule:
        if not value:
            return False
            
    if "max_length" in rule:
        import re
        m = re.search(r"max_length:(\d+)", rule)
        if m:
            max_len = int(m.group(1))
            if len(value) > max_len:
                return False
                
    if "integer_range" in rule:
        import re
        m = re.search(r"integer_range:(\d+)-(\d+)", rule)
        if m:
            min_val = int(m.group(1))
            max_val = int(m.group(2))
            try:
                int_val = int(value)
                if not (min_val <= int_val <= max_val):
                    return False
            except ValueError:
                return False
                
    return True

@app.post("/whatsapp/webhook")
async def handle_webhook(request: Request, db: AsyncSession = Depends(get_db)):
    await verify_signature(request)
    body = await request.json()
    
    try:
        entry = body["entry"][0]
        changes = entry["changes"][0]
        value = changes["value"]
        if "messages" not in value:
            return {"status": "ok"}
            
        message = value["messages"][0]
        from_phone = message["from"]
    except (KeyError, IndexError):
        return {"status": "ok"}
        
    session_obj = await session.get_or_create_session(db, from_phone)
    
    incoming_text = ""
    incoming_id = None
    
    if message["type"] == "text":
        incoming_text = message["text"]["body"].strip()
    elif message["type"] == "interactive":
        interactive = message["interactive"]
        if interactive["type"] == "button_reply":
            incoming_id = interactive["button_reply"]["id"]
            incoming_text = interactive["button_reply"]["title"]
        elif interactive["type"] == "list_reply":
            incoming_id = interactive["list_reply"]["id"]
            incoming_text = interactive["list_reply"]["title"]
            
    if incoming_text.lower() in graph.RESET_KEYWORDS:
        session.clear_to_root(session_obj)
        await session.save_session(db, session_obj)
        await graph.render_node("root", session_obj, from_phone)
        return {"status": "ok"}
        
    current_node = graph.get_node(session_obj.current_node)
    
    # Handle Navigation buttons first
    if incoming_id == "root":
        session.clear_to_root(session_obj)
        await session.save_session(db, session_obj)
        await graph.render_node("root", session_obj, from_phone)
        return {"status": "ok"}
    elif incoming_id == "__back__":
        session.pop_node(session_obj)
        await session.save_session(db, session_obj)
        await graph.render_node(session_obj.current_node, session_obj, from_phone)
        return {"status": "ok"}

    target_id = None
    set_ctx = None
    
    # Determine the selected option or process text input
    if current_node.get("type") == "text_input":
        # Text input node
        val = incoming_text
        rule = current_node.get("validation", "")
        if not validate_input(val, rule):
            import whatsapp
            err_msg = current_node.get("on_invalid", "Invalid input.")
            orig_msg = graph.format_message(current_node["message"], session_obj.context)
            await whatsapp.send_text(from_phone, f"{err_msg}\n\n{orig_msg}")
            return {"status": "ok"}
            
        target_id = current_node.get("next")
        ctx_key = current_node.get("context_key")
        if ctx_key:
            set_ctx = {ctx_key: val}
    else:
        # Options node
        options = current_node.get("options", [])
        selected_opt = None
        if incoming_id:
            for opt in options:
                if opt["id"] == incoming_id:
                    selected_opt = opt
                    break
        else:
            # Maybe they typed the label
            for opt in options:
                if opt["label"].lower() == incoming_text.lower():
                    selected_opt = opt
                    break
                    
        if selected_opt:
            target_id = selected_opt.get("next", selected_opt["id"])
            set_ctx = selected_opt.get("set_context")
            
    if not target_id:
        # Unknown input, just re-render current node
        node_to_render = graph.get_node(session_obj.current_node)
        if "message" not in node_to_render:
            session.clear_to_root(session_obj)
            await session.save_session(db, session_obj)
            await graph.render_node(session_obj.current_node, session_obj, from_phone)
        else:
            await graph.render_node(session_obj.current_node, session_obj, from_phone)
        return {"status": "ok"}
        
    if set_ctx:
        session.set_context(session_obj, set_ctx)
        
    session.push_node(session_obj, target_id)
    
    # Check for system action node
    next_node = graph.get_node(session_obj.current_node)
    if next_node.get("action") == "save_lead_and_notify_staff":
        lead = await leads.save_lead(db, session_obj)
        try:
            await leads.notify_staff(lead)
        except Exception as e:
            print(f"Failed to notify staff: {e}")
        target_id = next_node.get("next")
        session.push_node(session_obj, target_id)
        
    await session.save_session(db, session_obj)
    await graph.render_node(session_obj.current_node, session_obj, from_phone)
    
    return {"status": "ok"}

# AWS Lambda entry point — Mangum wraps the FastAPI ASGI app
handler = Mangum(app, lifespan="off")
