import base64
import logging
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status, Response
from fastapi.responses import Response
from pydantic import BaseModel
from sqlalchemy.orm import Session

from backend.app.core.database import get_db
from backend.app.core.deps import get_current_admin_user
from backend.app.models.user import User
from backend.app.models.ai_conversation import AIConversation, AIMessage
from backend.app.services.business_intelligence import get_business_kpis
from backend.app.services.groq_service import run_groq_conversation, generate_daily_briefing_summary
from backend.app.services.elevenlabs_service import synthesize_speech, transcribe_audio_stream, fetch_available_voices
from backend.app.services.ai_tools import execute_confirmed_action

logger = logging.getLogger("varshi_ai_router")

router = APIRouter(prefix="/admin/ai", tags=["AI Executive Assistant"])

# -----------------------------------------------------------------------------
# SCHEMAS
# -----------------------------------------------------------------------------

class TextChatRequest(BaseModel):
    message: str
    conversation_id: Optional[int] = None
    offset_minutes: Optional[int] = 330

class ActionExecutionRequest(BaseModel):
    action_type: str
    payload: Dict[str, Any]
    conversation_id: Optional[int] = None

class TTSRequest(BaseModel):
    text: str
    voice_id: Optional[str] = None

# -----------------------------------------------------------------------------
# 1. DAILY BUSINESS BRIEFING ENDPOINT
# -----------------------------------------------------------------------------

@router.get("/briefing")
async def get_daily_briefing(
    offset_minutes: int = 330,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin_user)
):
    """
    Computes real-time store metrics and generates an executive natural language greeting.
    """
    kpis = get_business_kpis(db, offset_minutes=offset_minutes)
    spoken_summary = generate_daily_briefing_summary(kpis, admin_name=admin.full_name)

    return {
        "admin_name": admin.full_name,
        "kpis": kpis,
        "spoken_summary": spoken_summary,
        "local_time": kpis.get("local_time"),
        "local_date": kpis.get("local_date")
    }

# -----------------------------------------------------------------------------
# 2. TEXT CHAT WITH AI MANAGER
# -----------------------------------------------------------------------------

@router.post("/chat")
async def chat_with_manager(
    req: TextChatRequest,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin_user)
):
    """
    Conversational text interface for the admin assistant.
    Analyzes live DB records, drafts products, and prepares packing lists.
    """
    if not req.message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty.")

    # 1. Get or create conversation
    conv = None
    if req.conversation_id:
        conv = db.query(AIConversation).filter(
            AIConversation.id == req.conversation_id,
            AIConversation.user_id == admin.id
        ).first()

    if not conv:
        conv = AIConversation(
            user_id=admin.id,
            title=req.message[:45] + ("..." if len(req.message) > 45 else "")
        )
        db.add(conv)
        db.commit()
        db.refresh(conv)

    # 2. Save user message
    user_msg = AIMessage(
        conversation_id=conv.id,
        role="user",
        content=req.message
    )
    db.add(user_msg)
    db.commit()

    # 3. Load recent conversation history
    db_messages = db.query(AIMessage).filter(
        AIMessage.conversation_id == conv.id
    ).order_by(AIMessage.created_at.asc()).limit(12).all()

    history = [{"role": m.role, "content": m.content} for m in db_messages]

    # 4. Run Groq agent with dynamic database tools
    result = run_groq_conversation(
        conversation_history=history,
        user_message=req.message,
        db=db,
        admin_name=admin.full_name
    )

    # 5. Persist assistant reply
    asst_msg = AIMessage(
        conversation_id=conv.id,
        role="assistant",
        content=result["assistant_response"],
        action_type=result.get("action_type"),
        action_data=result.get("action_payload"),
        requires_confirmation=result.get("requires_confirmation", False)
    )
    db.add(asst_msg)
    db.commit()
    db.refresh(asst_msg)

    return {
        "conversation_id": conv.id,
        "message_id": asst_msg.id,
        "reply": result["assistant_response"],
        "action_type": result.get("action_type"),
        "action_payload": result.get("action_payload"),
        "requires_confirmation": result.get("requires_confirmation", False),
        "tools_called": result.get("tools_called", [])
    }

# -----------------------------------------------------------------------------
# 3. VOICE CHAT (SPEECH-TO-TEXT -> GROQ -> TEXT-TO-SPEECH)
# -----------------------------------------------------------------------------

@router.post("/voice/chat")
async def voice_chat_with_manager(
    audio_file: UploadFile = File(...),
    conversation_id: Optional[int] = Form(None),
    offset_minutes: Optional[int] = Form(330),
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin_user)
):
    """
    Seamless push-to-talk voice pipeline:
    1. Transcribes incoming audio via ElevenLabs Speech-to-Text (or Groq Whisper fallback).
    2. Passes transcription to Groq AI Business Manager.
    3. Synthesizes assistant reply using ElevenLabs Text-to-Speech.
    4. Returns text, transcript, and Base64 audio stream.
    """
    # 1. Read audio bytes
    audio_bytes = await audio_file.read()
    if not audio_bytes or len(audio_bytes) < 500:
        raise HTTPException(status_code=400, detail="No audible speech detected. Please speak clearly into your microphone.")

    filename = audio_file.filename or "recording.webm"
    content_type = audio_file.content_type or "audio/webm"

    # 2. Transcribe speech
    try:
        user_text = await transcribe_audio_stream(audio_bytes, filename=filename, content_type=content_type)
    except Exception as e:
        logger.error(f"Speech transcription failed: {e}")
        raise HTTPException(status_code=500, detail="Could not transcribe audio. Please check your microphone input.")

    if not user_text:
        raise HTTPException(status_code=400, detail="Could not detect speech in audio clip.")

    # 3. Get or create conversation
    conv = None
    if conversation_id:
        conv = db.query(AIConversation).filter(
            AIConversation.id == conversation_id,
            AIConversation.user_id == admin.id
        ).first()

    if not conv:
        conv = AIConversation(
            user_id=admin.id,
            title=user_text[:45] + ("..." if len(user_text) > 45 else "")
        )
        db.add(conv)
        db.commit()
        db.refresh(conv)

    # 4. Save user message
    user_msg = AIMessage(
        conversation_id=conv.id,
        role="user",
        content=user_text
    )
    db.add(user_msg)
    db.commit()

    # 5. Load history
    db_messages = db.query(AIMessage).filter(
        AIMessage.conversation_id == conv.id
    ).order_by(AIMessage.created_at.asc()).limit(10).all()

    history = [{"role": m.role, "content": m.content} for m in db_messages]

    # 6. Run Groq with tools
    result = run_groq_conversation(
        conversation_history=history,
        user_message=user_text,
        db=db,
        admin_name=admin.full_name
    )

    asst_text = result["assistant_response"]

    # 7. Audio generation removed (Frontend uses native male Jarvis voice exclusively)
    audio_base64 = None

    # 8. Save assistant reply
    asst_msg = AIMessage(
        conversation_id=conv.id,
        role="assistant",
        content=asst_text,
        action_type=result.get("action_type"),
        action_data=result.get("action_payload"),
        requires_confirmation=result.get("requires_confirmation", False)
    )
    db.add(asst_msg)
    db.commit()
    db.refresh(asst_msg)

    return {
        "conversation_id": conv.id,
        "message_id": asst_msg.id,
        "user_transcript": user_text,
        "reply": asst_text,
        "audio_base64": audio_base64,
        "action_type": result.get("action_type"),
        "action_payload": result.get("action_payload"),
        "requires_confirmation": result.get("requires_confirmation", False),
        "tools_called": result.get("tools_called", [])
    }

# -----------------------------------------------------------------------------
# 4. TEXT-TO-SPEECH ONLY
# -----------------------------------------------------------------------------

@router.post("/voice/tts")
async def generate_tts_audio():
    """Disabled: Frontend uses native executive male Jarvis voice engine."""
    return Response(status_code=204)

# -----------------------------------------------------------------------------
# 5. EXECUTE CONFIRMED ACTION (ADMIN AUTHORIZATION GATE)
# -----------------------------------------------------------------------------

@router.post("/execute-action")
async def execute_action(
    req: ActionExecutionRequest,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin_user)
):
    """
    Executes a sensitive store action (e.g. publishing product, updating order status)
    only after explicit admin approval.
    """
    res = execute_confirmed_action(req.action_type, req.payload, db)

    # If associated with conversation, record the confirmation
    if req.conversation_id:
        conf_msg = AIMessage(
            conversation_id=req.conversation_id,
            role="system",
            content=res.get("message", "Action executed."),
            action_type=req.action_type,
            action_data=res,
            is_confirmed=True
        )
        db.add(conf_msg)
        db.commit()

    return res

# -----------------------------------------------------------------------------
# 6. CONVERSATION MANAGEMENT
# -----------------------------------------------------------------------------

@router.get("/conversations")
async def list_conversations(
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin_user)
):
    """Lists previous conversations for the authenticated admin."""
    convs = db.query(AIConversation).filter(
        AIConversation.user_id == admin.id
    ).order_by(AIConversation.updated_at.desc()).limit(20).all()

    return [
        {
            "id": c.id,
            "title": c.title,
            "created_at": c.created_at.strftime("%d %b %Y, %I:%M %p"),
            "updated_at": c.updated_at.strftime("%d %b %Y, %I:%M %p"),
        }
        for c in convs
    ]

@router.get("/conversations/{conversation_id}")
async def get_conversation_messages(
    conversation_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin_user)
):
    """Retrieves full message history of a conversation."""
    conv = db.query(AIConversation).filter(
        AIConversation.id == conversation_id,
        AIConversation.user_id == admin.id
    ).first()

    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found.")

    return {
        "id": conv.id,
        "title": conv.title,
        "messages": [
            {
                "id": m.id,
                "role": m.role,
                "content": m.content,
                "action_type": m.action_type,
                "action_data": m.action_data,
                "requires_confirmation": m.requires_confirmation,
                "is_confirmed": m.is_confirmed,
                "created_at": m.created_at.strftime("%I:%M %p")
            }
            for m in conv.messages
        ]
    }

@router.delete("/conversations/{conversation_id}")
async def delete_conversation(
    conversation_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin_user)
):
    """Deletes a conversation history."""
    conv = db.query(AIConversation).filter(
        AIConversation.id == conversation_id,
        AIConversation.user_id == admin.id
    ).first()

    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found.")

    db.delete(conv)
    db.commit()
    return {"success": True, "message": "Conversation deleted."}

@router.get("/voices")
async def get_voices(
    admin: User = Depends(get_current_admin_user)
):
    """Lists available ElevenLabs voices."""
    voices = await fetch_available_voices()
    return voices

