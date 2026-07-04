from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from models import ConversationSession

async def get_or_create_session(db: AsyncSession, phone: str) -> ConversationSession:
    result = await db.execute(select(ConversationSession).where(ConversationSession.phone_number == phone))
    session = result.scalar_one_or_none()
    if not session:
        session = ConversationSession(phone_number=phone)
        db.add(session)
        await db.commit()
        await db.refresh(session)
    return session

async def save_session(db: AsyncSession, session: ConversationSession):
    db.add(session)
    await db.commit()
    await db.refresh(session)

def push_node(session: ConversationSession, node_id: str):
    new_stack = list(session.node_stack)
    new_stack.append(session.current_node)
    session.node_stack = new_stack
    session.current_node = node_id

def pop_node(session: ConversationSession):
    if session.node_stack:
        new_stack = list(session.node_stack)
        prev_node = new_stack.pop()
        session.node_stack = new_stack
        session.current_node = prev_node
    else:
        session.current_node = "root"

def clear_to_root(session: ConversationSession):
    session.node_stack = []
    session.current_node = "root"

def set_context(session: ConversationSession, kv_dict: dict):
    new_context = dict(session.context)
    new_context.update(kv_dict)
    session.context = new_context
