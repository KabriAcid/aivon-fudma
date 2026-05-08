"""
WebSocket communication handler for real-time frontend-Python backend interaction
Manages socket events, streaming responses, and connection pooling
"""

import logging
from typing import Dict, Callable, Any
from datetime import datetime

logger = logging.getLogger(__name__)


class WebSocketManager:
    """Manages WebSocket connections and real-time messaging"""

    def __init__(self, socketio_instance):
        self.socketio = socketio_instance
        self.active_connections: Dict[str, Dict[str, Any]] = {}
        self.setup_event_handlers()

    def setup_event_handlers(self):
        """Register all WebSocket event handlers"""

        @self.socketio.on("connect")
        def handle_connect():
            from flask import request

            client_id = request.sid
            self.active_connections[client_id] = {
                "connected_at": datetime.now(),
                "language": "english",
                "session_id": None,
            }
            logger.info(f"Client {client_id} connected. Total: {len(self.active_connections)}")
            self.socketio.emit(
                "connection_response",
                {"status": "connected", "client_id": client_id, "timestamp": str(datetime.now())},
            )

        @self.socketio.on("disconnect")
        def handle_disconnect():
            from flask import request

            client_id = request.sid
            if client_id in self.active_connections:
                del self.active_connections[client_id]
            logger.info(f"Client {client_id} disconnected. Total: {len(self.active_connections)}")

        @self.socketio.on("ping")
        def handle_ping(data):
            """Heartbeat to keep connection alive"""
            from flask import request

            return {"pong": True, "timestamp": str(datetime.now())}

        @self.socketio.on("set_session")
        def handle_set_session(data):
            """Store session info for the client"""
            from flask import request

            client_id = request.sid
            if client_id in self.active_connections:
                self.active_connections[client_id]["session_id"] = data.get("session_id")
                self.active_connections[client_id]["language"] = data.get("language", "english")
            logger.info(f"Session set for {client_id}: {data}")

        @self.socketio.on("streaming_request")
        def handle_streaming_request(data):
            """Handle real-time streaming AI requests"""
            from flask import request
            from gemini_service import get_gemini_service
            from language_utils import LanguageDetector

            client_id = request.sid
            text = data.get("text", "")
            language = data.get("language", "english")
            use_stream = data.get("stream", True)

            if not text:
                self.socketio.emit(
                    "error",
                    {"client_id": client_id, "message": "No text provided"},
                    to=client_id,
                )
                return

            try:
                # Get or detect language
                if language == "auto":
                    language = LanguageDetector.detect_language(text)

                # Update client connection info
                if client_id in self.active_connections:
                    self.active_connections[client_id]["language"] = language

                gemini_service = get_gemini_service()

                # Send request acknowledgment
                self.socketio.emit(
                    "request_acknowledged",
                    {
                        "client_id": client_id,
                        "language": language,
                        "timestamp": str(datetime.now()),
                    },
                    to=client_id,
                )

                if use_stream:
                    # Stream response chunks
                    full_response = ""
                    for chunk in gemini_service.stream_response(text, language):
                        full_response += chunk
                        self.socketio.emit(
                            "response_chunk",
                            {
                                "client_id": client_id,
                                "chunk": chunk,
                                "language": language,
                            },
                            to=client_id,
                        )

                    # Send completion signal
                    self.socketio.emit(
                        "response_complete",
                        {
                            "client_id": client_id,
                            "full_response": full_response,
                            "language": language,
                            "timestamp": str(datetime.now()),
                        },
                        to=client_id,
                    )
                else:
                    # Single response
                    response = gemini_service.generate_response(text, language)
                    self.socketio.emit(
                        "response_complete",
                        {
                            "client_id": client_id,
                            "full_response": response,
                            "language": language,
                            "timestamp": str(datetime.now()),
                        },
                        to=client_id,
                    )

            except Exception as e:
                logger.error(f"Streaming error for {client_id}: {e}")
                self.socketio.emit(
                    "error",
                    {
                        "client_id": client_id,
                        "message": f"Processing error: {str(e)}",
                    },
                    to=client_id,
                )

        @self.socketio.on("quick_response")
        def handle_quick_response(data):
            """Fast non-streaming response"""
            from flask import request
            from gemini_service import get_gemini_service

            client_id = request.sid
            text = data.get("text", "")
            language = data.get("language", "english")

            if not text:
                self.socketio.emit(
                    "error",
                    {"client_id": client_id, "message": "No text provided"},
                    to=client_id,
                )
                return

            try:
                gemini_service = get_gemini_service()
                response = gemini_service.generate_response(text, language)

                self.socketio.emit(
                    "quick_response_ready",
                    {
                        "client_id": client_id,
                        "response": response,
                        "language": language,
                    },
                    to=client_id,
                )
            except Exception as e:
                logger.error(f"Quick response error: {e}")
                self.socketio.emit(
                    "error",
                    {"client_id": client_id, "message": "Failed to generate response"},
                    to=client_id,
                )

        @self.socketio.on("analyze_request")
        def handle_analyze(data):
            """Analyze text (language detection, etc.)"""
            from flask import request
            from language_utils import LanguageDetector

            client_id = request.sid
            text = data.get("text", "")

            if not text:
                self.socketio.emit(
                    "error",
                    {"client_id": client_id, "message": "No text provided"},
                    to=client_id,
                )
                return

            try:
                detected_language = LanguageDetector.detect_language(text)

                self.socketio.emit(
                    "analysis_complete",
                    {
                        "client_id": client_id,
                        "detected_language": detected_language,
                        "confidence": 0.85,
                    },
                    to=client_id,
                )
            except Exception as e:
                logger.error(f"Analysis error: {e}")
                self.socketio.emit(
                    "error",
                    {"client_id": client_id, "message": "Analysis failed"},
                    to=client_id,
                )

    def get_connection_count(self) -> int:
        """Get number of active connections"""
        return len(self.active_connections)

    def get_connection_info(self, client_id: str) -> Dict:
        """Get connection details for a client"""
        return self.active_connections.get(client_id, {})

    def broadcast_message(self, event: str, data: Dict):
        """Send message to all connected clients"""
        self.socketio.emit(event, data, broadcast=True)
