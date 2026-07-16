import json
from pathlib import Path
import whatsapp

BASE_DIR = Path(__file__).resolve().parent

with open(BASE_DIR / "nodes.json", "r", encoding="utf-8") as f:
    NODES = json.load(f)

RESET_KEYWORDS = {"hi", "hello", "menu", "start", "restart"}

def get_dynamic_options(node_id: str) -> list:
    from datetime import datetime, timedelta
    now = datetime.utcnow() + timedelta(hours=5, minutes=30)  # IST
    candidate = now.date() + timedelta(days=1)
    options = []
    days_added = 0

    if node_id == "collect_date":
        # Physical (CK Birla): Mon–Sat, skip Sunday
        while days_added < 3:
            if candidate.weekday() != 6:
                day_str = candidate.strftime("%A, %d %b")
                options.append({
                    "id": f"date_{days_added}",
                    "next": "collect_time_slot",
                    "label": day_str,
                    "set_context": {"preferred_date": day_str}
                })
                days_added += 1
            candidate += timedelta(days=1)
        return options

    if node_id == "collect_online_date":
        # Online: Mon–Fri only
        while days_added < 3:
            if candidate.weekday() < 5:
                day_str = candidate.strftime("%A, %d %b")
                options.append({
                    "id": f"odate_{days_added}",
                    "next": "collect_online_time",
                    "label": day_str,
                    "set_context": {"preferred_date": day_str}
                })
                days_added += 1
            candidate += timedelta(days=1)
        return options

    return []

def get_node(node_id: str):
    if node_id not in NODES:
        raise KeyError(f"Node '{node_id}' not found in nodes.json")
    node = dict(NODES[node_id])
    dyn_opts = get_dynamic_options(node_id)
    if dyn_opts:
        node["options"] = dyn_opts
    return node

def format_message(text: str, context: dict) -> str:
    """Replaces {field|default} with context values"""
    import re
    def replace_match(match):
        inner = match.group(1)
        if "|" in inner:
            key, default = inner.split("|", 1)
        else:
            key, default = inner, ""
        return str(context.get(key) or default)
    return re.sub(r"\{([^}]+)\}", replace_match, text)

async def render_node(node_id: str, session_obj, to_phone: str):
    node = get_node(node_id)
    text = format_message(node["message"], session_obj.context)
    
    options = node.get("options", [])
    show_back = node.get("show_back", False)
    show_home = node.get("show_home", False)
    
    render_as = node.get("render_as")
    
    items = []
    for opt in options:
        items.append({"id": opt["id"], "title": opt["label"]})
    
    if show_back:
        items.append({"id": "__back__", "title": "Back"})
    if show_home:
        items.append({"id": "root", "title": "Main menu"})
        
    if render_as == "text_input":
        if items:
            await whatsapp.send_buttons(to_phone, text, items)
        else:
            await whatsapp.send_text(to_phone, text)
    elif render_as == "buttons" or (render_as is None and len(items) <= 3):
        await whatsapp.send_buttons(to_phone, text, items)
    elif render_as == "list" or (render_as is None and len(items) > 3):
        await whatsapp.send_list(to_phone, text, items)
    else:
        # Fallback to buttons
        await whatsapp.send_buttons(to_phone, text, items[:3])




