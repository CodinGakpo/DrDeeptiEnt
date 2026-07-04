import os
from sqlalchemy.ext.asyncio import AsyncSession
from models import ConversationSession, WhatsAppLead
import whatsapp

STAFF_WHATSAPP_NUMBER = os.environ.get("STAFF_WHATSAPP_NUMBER")

async def save_lead(db: AsyncSession, session_obj: ConversationSession) -> WhatsAppLead:
    ctx = session_obj.context
    
    lead = WhatsAppLead(
        phone_number=session_obj.phone_number,
        patient_name=ctx.get("name", "Unknown"),
        age=int(ctx.get("age", 0)),
        concern=ctx.get("concern", "General consultation"),
        location=ctx.get("location", "Unknown Location"),
        preferred_time=ctx.get("preferred_time", "Unknown Time")
    )
    
    db.add(lead)
    await db.commit()
    await db.refresh(lead)
    return lead

async def notify_staff(lead: WhatsAppLead):
    if not STAFF_WHATSAPP_NUMBER:
        return
        
    text = (
        f"🚨 *New WhatsApp Lead*\n\n"
        f"Name: {lead.patient_name}\n"
        f"Age: {lead.age}\n"
        f"Concern: {lead.concern}\n"
        f"Location: {lead.location}\n"
        f"Preferred Time: {lead.preferred_time}\n"
        f"Phone: {lead.phone_number}"
    )
    
    await whatsapp.send_text(STAFF_WHATSAPP_NUMBER, text)
