import io
import logging
from typing import Optional, Dict, Any, List
import httpx
import groq

from backend.app.core.config import settings

logger = logging.getLogger("varshi_elevenlabs")

ELEVENLABS_BASE_URL = "https://api.elevenlabs.io/v1"

async def synthesize_speech(
    text: str,
    voice_id: Optional[str] = None,
    model_id: Optional[str] = None
) -> bytes:
    """
    Converts assistant response text to high-fidelity spoken audio using ElevenLabs REST API.
    Returns MP3 audio bytes.
    """
    if not settings.ELEVENLABS_API_KEY:
        raise ValueError("ELEVENLABS_API_KEY is not configured.")

    target_voice = voice_id or settings.ELEVENLABS_VOICE_ID
    target_model = model_id or settings.ELEVENLABS_MODEL_ID

    # Limit spoken text to first 450 characters if long to conserve credits & maintain crisp delivery
    clean_text = text.strip()
    if len(clean_text) > 450:
        clean_text = clean_text[:440] + "..."

    headers = {
        "xi-api-key": settings.ELEVENLABS_API_KEY,
        "Content-Type": "application/json",
        "Accept": "audio/mpeg"
    }

    payload = {
        "text": clean_text,
        "model_id": target_model,
        "voice_settings": {
            "stability": 0.52,
            "similarity_boost": 0.78,
            "style": 0.2,
            "use_speaker_boost": True
        }
    }

    url = f"{ELEVENLABS_BASE_URL}/text-to-speech/{target_voice}"

    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.post(url, json=payload, headers=headers)
        if response.status_code != 200:
            logger.error(f"ElevenLabs TTS failed [{response.status_code}]: {response.text}")
            raise Exception(f"ElevenLabs TTS service error: {response.text}")
        return response.content

async def transcribe_audio_stream(
    audio_bytes: bytes,
    filename: str = "recording.webm",
    content_type: str = "audio/webm"
) -> str:
    """
    Transcribes spoken voice audio to text using ElevenLabs Speech-to-Text,
    with automatic ultra-fast Groq Whisper fallback for maximum resilience.
    """
    # 1. Primary: Try ElevenLabs Speech-to-Text
    if settings.ELEVENLABS_API_KEY:
        try:
            url = f"{ELEVENLABS_BASE_URL}/speech-to-text"
            headers = {
                "xi-api-key": settings.ELEVENLABS_API_KEY
            }
            files = {
                "file": (filename, audio_bytes, content_type)
            }
            data = {
                "model_id": "scribe_v1"
            }

            async with httpx.AsyncClient(timeout=25.0) as client:
                res = await client.post(url, headers=headers, files=files, data=data)
                if res.status_code == 200:
                    result_json = res.json()
                    transcription = result_json.get("text", "").strip()
                    if transcription:
                        logger.info(f"ElevenLabs STT transcription: '{transcription}'")
                        return transcription
                else:
                    logger.warning(f"ElevenLabs STT status {res.status_code}: {res.text}, falling back to Groq Whisper")
        except Exception as e:
            logger.warning(f"ElevenLabs STT error: {e}, falling back to Groq Whisper")

    # 2. Resilient Fallback: Groq Whisper Large V3 Turbo
    try:
        groq_client = groq.Groq(api_key=settings.GROQ_API_KEY)
        audio_file = (filename, io.BytesIO(audio_bytes), content_type)
        transcription_res = groq_client.audio.transcriptions.create(
            file=audio_file,
            model="whisper-large-v3-turbo",
            response_format="json",
            language="en"
        )
        text = transcription_res.text.strip()
        logger.info(f"Groq Whisper transcription: '{text}'")
        return text
    except Exception as e:
        logger.error(f"Groq Whisper fallback failed: {e}")
        raise Exception("Could not transcribe speech audio. Please ensure microphone audio is clear.")

async def fetch_available_voices() -> List[Dict[str, Any]]:
    """Fetches list of configured ElevenLabs voices."""
    if not settings.ELEVENLABS_API_KEY:
        return []

    headers = {"xi-api-key": settings.ELEVENLABS_API_KEY}
    url = f"{ELEVENLABS_BASE_URL}/voices"

    async with httpx.AsyncClient(timeout=10.0) as client:
        res = await client.get(url, headers=headers)
        if res.status_code == 200:
            voices = res.json().get("voices", [])
            return [
                {
                    "voice_id": v.get("voice_id"),
                    "name": v.get("name"),
                    "category": v.get("category"),
                    "description": v.get("labels", {}).get("description") or v.get("name")
                }
                for v in voices
            ]
        return []

