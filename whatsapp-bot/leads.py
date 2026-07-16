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
        preferred_time=f"{ctx.get('preferred_date', '')} {ctx.get('preferred_slot', '')}".strip() or "Unknown Time"
    )
    
    db.add(lead)
    await db.commit()
    await db.refresh(lead)
    return lead

async def notify_staff(lead: WhatsAppLead):
    if not STAFF_WHATSAPP_NUMBER:
        return
        
    staff_num = STAFF_WHATSAPP_NUMBER.replace("+", "").replace(" ", "").replace("-", "")
    
    # Generate a short booking ID from the UUID (e.g. B-8F2A)
    booking_id = f"B-{str(lead.id).split('-')[0][:4].upper()}"
    
    variables = [
        booking_id,
        lead.patient_name,
        str(lead.age),
        lead.concern or "General consultation",
        lead.location,
        lead.preferred_time,
        lead.phone_number
    ]
    
    await whatsapp.send_template(staff_num, "new_lead_alert", "en", variables)
