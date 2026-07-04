import uuid
from sqlalchemy import Column, String, Integer, DateTime, func
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import declarative_base

Base = declarative_base()

class ConversationSession(Base):
    __tablename__ = "whatsapp_sessions"
    
    phone_number = Column(String, primary_key=True)
    current_node = Column(String, nullable=False, default="root")
    node_stack = Column(JSONB, nullable=False, default=list)
    context = Column(JSONB, nullable=False, default=dict)
    last_interaction = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

class WhatsAppLead(Base):
    __tablename__ = "whatsapp_leads"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    phone_number = Column(String, nullable=False)
    patient_name = Column(String, nullable=False)
    age = Column(Integer, nullable=False)
    concern = Column(String, nullable=True)
    location = Column(String, nullable=False)
    preferred_time = Column(String, nullable=False)
    status = Column(String, nullable=False, default="new")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
