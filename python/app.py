"""
Flask microservice for advanced AI processing with real-time WebSocket support
Provides both REST API and WebSocket endpoints for frontend communication
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_socketio import SocketIO, emit
from dotenv import load_dotenv
import os
import logging

from gemini_service import get_gemini_service
from analytics import CallAnalytics, SessionStorage
from language_utils import LanguageDetector, get_language_prompt
from websocket_handler import WebSocketManager

load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

# Initialize WebSocket support
socketio = SocketIO(app, cors_allowed_origins="*")
ws_manager = WebSocketManager(socketio)

# Initialize Gemini service
try:
    gemini_service = get_gemini_service()
    logger.info("Gemini service initialized successfully")
except Exception as e:
    logger.error(f"Failed to initialize Gemini service: {e}")
    gemini_service = None


@app.route("/health", methods=["GET"])
def health():
    """Health check endpoint with connection stats"""
    return jsonify({
        "status": "ok",
        "service": "python-ai-service",
        "version": "1.0",
        "websocket_enabled": True,
        "active_connections": ws_manager.get_connection_count(),
        "gemini_available": gemini_service is not None
    })


@app.route("/api/analyze", methods=["POST"])
def analyze_text():
    """
    Advanced text analysis endpoint
    Detects language, processes sentiment, etc.
    """
    try:
        data = request.json
        text = data.get("text", "")
        
        if not text:
            return jsonify({"error": "No text provided"}), 400
        
        detected_language = LanguageDetector.detect_language(text)
        
        return jsonify({
            "text": text,
            "detected_language": detected_language,
            "confidence": 0.85  # Placeholder
        })
    
    except Exception as e:
        logger.error(f"Analysis error: {e}")
        return jsonify({"error": str(e)}), 500


@app.route("/api/generate-response", methods=["POST"])
def generate_response():
    """
    Generate AI response using Gemini
    Parallel endpoint to Node.js backend (for testing/migration)
    """
    try:
        if not gemini_service:
            return jsonify({"error": "AI service not configured"}), 500
        
        data = request.json
        text = data.get("text", "")
        language = data.get("language", "english")
        
        if not text:
            return jsonify({"error": "No text provided"}), 400
        
        response = gemini_service.generate_response(text, language)
        
        return jsonify({
            "message": response,
            "language": language
        })
    
    except Exception as e:
        logger.error(f"Generation error: {e}")
        return jsonify({"error": str(e)}), 500


@app.route("/api/session-summary", methods=["POST"])
def generate_session_summary():
    """
    Generate call session summary with analytics
    """
    try:
        data = request.json
        
        # Calculate metrics
        metrics = CallAnalytics.calculate_metrics(
            duration=data.get("duration", 0),
            message_count=data.get("messageCount", 0),
            transcript=data.get("transcript", []),
            language=data.get("language", "english")
        )
        
        # Generate summary
        summary = CallAnalytics.generate_summary(data, metrics)
        
        # Save session
        saved_path = SessionStorage.save_session(summary)
        
        return jsonify({
            "success": True,
            "summary": summary,
            "saved_to": saved_path
        })
    
    except Exception as e:
        logger.error(f"Session summary error: {e}")
        return jsonify({"error": str(e)}), 500


@app.route("/api/language-prompt/<prompt_type>/<language>", methods=["GET"])
def get_prompt(prompt_type: str, language: str):
    """
    Get predefined prompts in specific language
    """
    try:
        prompt = get_language_prompt(language, prompt_type)
        
        if not prompt:
            return jsonify({"error": f"Prompt {prompt_type} not found in {language}"}), 404
        
        return jsonify({
            "language": language,
            "prompt_type": prompt_type,
            "content": prompt
        })
    
    except Exception as e:
        logger.error(f"Prompt fetch error: {e}")
        return jsonify({"error": str(e)}), 500


@app.errorhandler(404)
def not_found(error):
    """Handle 404 errors"""
    return jsonify({"error": "Endpoint not found"}), 404


@app.errorhandler(500)
def internal_error(error):
    """Handle 500 errors"""
    logger.error(f"Internal server error: {error}")
    return jsonify({"error": "Internal server error"}), 500


if __name__ == "__main__":
    port = int(os.getenv("PYTHON_PORT", 5000))
    debug = os.getenv("FLASK_ENV") == "development"

    logger.info(f"Starting Python AI service on port {port}")
    logger.info("WebSocket support enabled for real-time communication")
    socketio.run(app, host="0.0.0.0", port=port, debug=debug, allow_unsafe_werkzeug=True)
