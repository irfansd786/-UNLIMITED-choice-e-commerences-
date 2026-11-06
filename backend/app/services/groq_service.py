import json
import logging
from typing import List, Dict, Any, Optional, Tuple
import groq

from backend.app.core.config import settings
from backend.app.services.ai_tools import GROQ_TOOL_DEFINITIONS, execute_tool

logger = logging.getLogger("varshi_groq")

SYSTEM_PROMPT = f"""You are the personal AI Business Manager and Executive Operations Assistant for Varshi Enterprises, an ultra-premium menswear and streetwear luxury e-commerce house.
You speak with the authorized store owner / administrator (addressed respectfully as '{settings.ADMIN_PREFERRED_TITLE}').

CORE OPERATING PRINCIPLES:
1. TRUTH & AUTHENTICITY: Never invent, extrapolate, or hallucinate store metrics, revenue, stock counts, or sales numbers. Always inspect the live database using your tools.
2. CURRENCY: Always use Indian Rupees (₹). Format amounts clearly (e.g. ₹38,500).
3. PROACTIVE BUSINESS ACUMEN: When reporting data, highlight actionable insights—e.g. identify which orders need packing right now, highlight fast-moving inventory close to stockout, and warn about unresolved customer returns.
4. TONE & MANNER: Sharp, sophisticated, professional, concise, and executive. Do NOT write walls of text. Be direct, authoritative, and friendly.
5. ACTION CONFIRMATION:
   - When the admin asks to add a product, use `draft_product` to prepare a complete structured draft. Then explicitly ask for the Chief's confirmation before anything is published.
   - When the admin asks to change order status or cancel orders, use `request_order_status_update` and confirm before executing.
   - For packing lists, generate the list cleanly using `prepare_packing_list` without changing order statuses.
6. SPOKEN READINESS: Keep summaries crisp so that when converted to voice by ElevenLabs, it sounds natural and executive without reading large tables aloud.
"""

def get_groq_client() -> groq.Groq:
    """Instantiates Groq client with configured API key."""
    return groq.Groq(api_key=settings.GROQ_API_KEY)

def generate_daily_briefing_summary(kpis: Dict[str, Any], admin_name: str = "Chief") -> str:
    """
    Generates a natural, spoken executive summary for the daily welcome briefing using Groq.
    """
    client = get_groq_client()

    date_str = kpis.get("local_date", "Today")
    local_time = kpis.get("local_time", "")
    sales = kpis.get("sales", {})
    pipeline = kpis.get("orders_pipeline", {})
    inv = kpis.get("inventory", {})
    care = kpis.get("customer_care", {})

    # Determine time-of-day greeting (morning, afternoon, evening, night)
    greeting_prefix = f"Good morning, {admin_name}"
    if local_time:
        try:
            from datetime import datetime
            parsed_dt = datetime.strptime(local_time.strip(), "%I:%M %p")
            h = parsed_dt.hour
            if 5 <= h < 12:
                greeting_prefix = f"Good morning, {admin_name}"
            elif 12 <= h < 17:
                greeting_prefix = f"Good afternoon, {admin_name}"
            elif 17 <= h < 21:
                greeting_prefix = f"Good evening, {admin_name}"
            else:
                greeting_prefix = f"Good night, {admin_name}"
        except Exception:
            greeting_prefix = f"Good day, {admin_name}"

    briefing_system_prompt = (
        "You are the personal AI Business Manager for Varshi Enterprises, an ultra-premium menswear brand. "
        "Your task is to synthesize the verified store metrics provided by the database into a crisp, polished, "
        "natural executive morning briefing for the store leader. Never invent numbers; use the exact figures provided. "
        "Keep the briefing concise (under 60 words) and pleasant, optimized for spoken voice audio."
    )

    prompt = f"""Verified Database Statistics:
- Date: {date_str}
- Today's Paid Revenue: ₹{sales.get('today_revenue', 0):,.2f} across {sales.get('today_orders', 0)} orders.
- Average Order Value: ₹{sales.get('today_aov', 0):,.2f}.
- Orders waiting for packaging: {pipeline.get('ready_to_pack_count', 0)} orders.
- Total Active Catalog Products: {inv.get('total_active_products', 0)}.
- Low Stock Items: {inv.get('low_stock_count', 0)} items below threshold.
- Unresolved Customer Issues/Returns: {care.get('complaints_count', 0)} complaints, {pipeline.get('return_requested', 0)} return requests.

Requirements:
- Begin with the greeting: "{greeting_prefix}."
- State today's orders and revenue clearly in Indian Rupees (₹).
- Mention orders ready for packaging or any low stock inventory if present.
- Keep the narrative under 60 words for clear voice delivery."""

    try:
        completion = client.chat.completions.create(
            model=settings.GROQ_MODEL,
            messages=[
                {"role": "system", "content": briefing_system_prompt},
                {"role": "user", "content": prompt}
            ],
            temperature=0.3,
            max_tokens=400
        )
        content = completion.choices[0].message.content.strip()
        if content:
            return content
    except Exception as e:
        logger.warning(f"Groq briefing generation fallback: {e}")

    # Safe fallback using actual DB values if Groq is momentarily unreachable
    return f"{greeting_prefix}. Today we have recorded {sales.get('today_orders', 0)} orders worth ₹{sales.get('today_revenue', 0):,.2f}. There are {pipeline.get('ready_to_pack_count', 0)} orders waiting for fulfillment, and inventory counts remain stable."

def run_groq_conversation(
    conversation_history: List[Dict[str, Any]],
    user_message: str,
    db: Any,
    admin_name: str = "Chief"
) -> Dict[str, Any]:
    """
    Executes a multi-turn conversation with Groq, resolving tool calls against the real database.
    Returns:
    {
        "assistant_response": str,
        "action_type": Optional[str],
        "action_payload": Optional[dict],
        "requires_confirmation": bool,
        "tools_called": List[str]
    }
    """
    client = get_groq_client()

    messages: List[Dict[str, Any]] = [
        {"role": "system", "content": SYSTEM_PROMPT}
    ]

    # Append recent conversation history (last 10 messages for speed and context)
    for msg in conversation_history[-10:]:
        role = msg.get("role", "user")
        content = msg.get("content", "")
        if role in ["user", "assistant"]:
            messages.append({"role": role, "content": content})

    # Append new user prompt
    messages.append({"role": "user", "content": user_message})

    tools_called: List[str] = []
    action_type = None
    action_payload = None
    requires_confirmation = False

    # Multi-turn tool execution loop (max 4 turns to avoid infinite loops)
    for turn in range(4):
        try:
            response = client.chat.completions.create(
                model=settings.GROQ_MODEL,
                messages=messages,
                tools=GROQ_TOOL_DEFINITIONS,
                tool_choice="auto",
                temperature=0.25,
                max_tokens=900
            )
        except Exception as e:
            logger.error(f"Groq API error on turn {turn}: {e}")
            # Try fallback model if available
            try:
                response = client.chat.completions.create(
                    model=settings.GROQ_FALLBACK_MODEL,
                    messages=messages,
                    tools=GROQ_TOOL_DEFINITIONS,
                    tool_choice="auto",
                    temperature=0.25,
                    max_tokens=900
                )
            except Exception as e2:
                logger.error(f"Groq Fallback error: {e2}")
                return {
                    "assistant_response": "I encountered a momentary connection difficulty reaching the Groq intelligence engine. Please ask again in a moment.",
                    "action_type": None,
                    "action_payload": None,
                    "requires_confirmation": False,
                    "tools_called": []
                }

        choice = response.choices[0]
        msg = choice.message

        # Check if model requested tool execution
        if msg.tool_calls:
            # Convert message to dict format for next turn
            messages.append(msg)

            for tool_call in msg.tool_calls:
                fn_name = tool_call.function.name
                tools_called.append(fn_name)
                try:
                    fn_args = json.loads(tool_call.function.arguments) if tool_call.function.arguments else {}
                except Exception:
                    fn_args = {}

                logger.info(f"Executing AI Tool: {fn_name} with args: {fn_args}")
                tool_result = execute_tool(fn_name, fn_args, db)

                # Check if this tool produces a prepared action requiring confirmation
                if tool_result.get("requires_confirmation"):
                    requires_confirmation = True
                    action_type = tool_result.get("action_type")
                    action_payload = tool_result.get("draft_product") or tool_result.get("payload")

                # Send tool execution result back to model
                messages.append({
                    "role": "tool",
                    "tool_call_id": tool_call.id,
                    "name": fn_name,
                    "content": json.dumps(tool_result)
                })

            # Continue loop to let Groq generate the final natural response
            continue
        else:
            # Final text response reached
            final_content = msg.content or "Chief, I have reviewed the store data."
            return {
                "assistant_response": final_content,
                "action_type": action_type,
                "action_payload": action_payload,
                "requires_confirmation": requires_confirmation,
                "tools_called": tools_called
            }

    return {
        "assistant_response": "Chief, I have completed the database analysis and updated the store ledger.",
        "action_type": action_type,
        "action_payload": action_payload,
        "requires_confirmation": requires_confirmation,
        "tools_called": tools_called
    }
