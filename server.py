import logging
from threading import Thread
from dotenv import load_dotenv
from livekit.agents import (
    AutoSubscribe,
    JobContext,
    JobProcess,
    WorkerOptions,
    WorkerType,
    cli,
    llm,
)
from livekit.agents.pipeline import VoicePipelineAgent
from livekit.plugins import openai, silero, deepgram
import json
import firebase_admin
from firebase_admin import credentials, db
from livekit import rtc
from livekit.agents.llm import ChatMessage, ChatImage
import asyncio

# Load environment variables
load_dotenv(dotenv_path=".env")
logger = logging.getLogger("voice-agent")

# Initialize Firebase
cred = credentials.Certificate("serviceAccountKey.json")  # Replace with your service account key path

firebase_admin.initialize_app(cred, {
    'databaseURL': 'https://athentication-3c73e-default-rtdb.firebaseio.com'
})

status = {"running": False, "connected_room": None}

async def get_video_track(room: rtc.Room):
    """Find and return the first available remote video track in the room."""
    for participant_id, participant in room.remote_participants.items():
        for track_id, track_publication in participant.track_publications.items():
            if track_publication.track and isinstance(
                track_publication.track, rtc.RemoteVideoTrack
            ):
                logger.info(
                    f"Found video track {track_publication.track.sid} "
                    f"from participant {participant_id}"
                )
                return track_publication.track
    raise ValueError("No remote video track found in the room")

async def get_latest_image(room: rtc.Room):
    """Capture and return a single frame from the video track."""
    video_stream = None
    try:
        video_track = await get_video_track(room)
        video_stream = rtc.VideoStream(video_track)
        async for event in video_stream:
            logger.debug("Captured latest video frame")
            return event.frame
    except Exception as e:
        logger.error(f"Failed to get latest image: {e}")
        return None
    finally:
        if video_stream:
            await video_stream.aclose()

def prewarm(proc: JobProcess):
    proc.userdata["vad"] = silero.VAD.load()

def get_session_data(session_id: str):
    """Retrieve session data from Firebase based on session ID"""
    try:
        # First try to get from sessions/${sessionId}
        session_ref = db.reference(f'sessions/{session_id}')
        session_data = session_ref.get()

        if not session_data:
            # If not found, try keys/variable/sessionid
            keys_ref = db.reference('keys/variable/sessionid')
            all_sessions = keys_ref.get()
            if all_sessions:
                session_data = next(
                    (session for session in all_sessions.values() if session.get('sessionId') == session_id),
                    None
                )

        return session_data
    except Exception as e:
        logger.error(f"Error retrieving session data: {e}")
        return None

async def entrypoint(ctx: JobContext):
    global status

    initial_ctx = llm.ChatContext().append(
        role="system",
        text=(
            "You are Mockello's hr. First introduce yourself and mention the company you are representing. Your role is to conduct pre-interview candidate evaluations for college freshers. Through both visual and verbal interaction, assess candidates on:\n\n"
            "1. Technical Knowledge: Evaluate depth of understanding in their field (high weightage). Be rigorous in testing technical knowledge, ensuring candidates demonstrate a strong grasp of concepts.\n"
            "2. Communication Skills: Assess clarity, pace, and articulation\n"
            "3. Professional Conduct: Validate dress code at the beginning of the interview. Only mention if there are significant concerns about:\n"
            "   - Inappropriate attire for a professional interview\n"
            "   - Notably unprofessional behavior\n"
            "   - Concerning facial expressions or body language\n"
            "   - Ensure the camera is turned on and the environment is well lit. If not, kindly request the candidate to adjust accordingly.\n"
            "   - Verify that there is no one in the background during the interview.\n"
            "   - If inappropriate behavior continues, inform the candidate that it will be noted in the evaluation process.\n"
            "4. Situational Awareness: Evaluate problem-solving and adaptability\n\n"
            "Keep responses concise and constructive. Focus on the candidate's abilities and potential. Only address appearance or demeanor if it would significantly impact their professional success.\n\n"
            "You will ask a total of 15 questions, giving higher weightage to technical knowledge. At the end of the interview, always ask: 'Do you have any further questions for me?'\n\n"
            "Additionally, generate questions based on the candidate's resume details to assess their qualifications and experiences effectively. Align these questions with the company's required skills for the role, ensuring a comprehensive evaluation.\n\n"
            "At any cost, do not help or guide the students during the evaluation process. Maintain a neutral and impartial stance to ensure the integrity of the assessment."
        ),
    )

    logger.info(f"Connecting to room {ctx.room.name}")
    status["running"] = True
    status["connected_room"] = ctx.room.name

    try:
        await ctx.connect(auto_subscribe=AutoSubscribe.SUBSCRIBE_ALL)
        participant = await ctx.wait_for_participant()
        logger.info(f"Starting voice assistant for participant {participant.identity}")

        metadata = participant.metadata
        session_id = None

        if metadata:
            try:
                metadata_dict = json.loads(metadata)
                session_id = metadata_dict.get("sessionId")
                logger.info(f"Session ID received: {session_id}")
            except json.JSONDecodeError as e:
                logger.warning(f"Failed to decode metadata: {e}")

        if not session_id:
            logger.error("No session ID provided")
            await ctx.disconnect()
            return

        # Retrieve session data from Firebase
        session_data = get_session_data(session_id)
        if not session_data:
            logger.error(f"No session data found for session ID: {session_id}")
            await ctx.disconnect()
            return

        # Append the roleplay prompt from Firebase to the context
        roleplay_prompt = session_data.get('roleplayPrompt')
        if roleplay_prompt:
            initial_ctx.append(
                role="system",
                text=(f"Interview and Candidate Resume Context:\n{roleplay_prompt}\n\n"
                      "Use this context to frame relevant questions and evaluate the candidate accordingly. You can now both see and hear the candidate. "
                      "When you see an image in our conversation, naturally incorporate what you see "
                      "into your response. Keep visual descriptions small but informative. "
                      "You should use short and concise responses, avoiding unpronounceable punctuation."
                      )
            )

        async def before_llm_cb(assistant: VoicePipelineAgent, chat_ctx: llm.ChatContext):
            """
            Callback that runs right before the LLM generates a response.
            Captures the current video frame and adds it to the conversation context.
            """
            latest_image = await get_latest_image(ctx.room)
            if latest_image:
                image_content = [ChatImage(image=latest_image)]
                chat_ctx.messages.append(ChatMessage(role="user", content=image_content))
                logger.debug("Added latest frame to conversation context")

        # Wait a bit for tracks to be published
        await asyncio.sleep(2)

        assistant = VoicePipelineAgent(
            vad=silero.VAD.load(),
            stt=deepgram.STT(),
            llm=openai.LLM(model="gpt-4o-mini"),
            tts=openai.TTS(),
            chat_ctx=initial_ctx,
            before_llm_cb=before_llm_cb
        )

        assistant.start(ctx.room, participant)

        await assistant.say(
            "Welcome to your pre-interview evaluation. Please note that your being observed and assessed. Let's start."
        )

        await assistant.say("Hey, tell me about yourself.")

    except Exception as e:
        logger.error(f"Error in entrypoint: {e}")
        if ctx.room:
            await ctx.disconnect()
    finally:
        status["running"] = False
        status["connected_room"] = None

if __name__ == "__main__":
    try:
        # Register the plugin in the main thread
        openai_plugin = openai.OpenAIPlugin()
        openai.Plugin.register_plugin(openai_plugin)  # Ensure plugin is registered on the main thread

        # Run the LiveKit app
        cli.run_app(
            WorkerOptions(
                entrypoint_fnc=entrypoint,
                prewarm_fnc=prewarm,
                worker_type=WorkerType.ROOM,
                port=8600
            ),
        )
    except Exception as e:
        logger.error(f"Error starting server: {e}")