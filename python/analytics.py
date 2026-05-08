"""
Analytics and Session Data Processing
Handles call analytics and session metrics
"""

from typing import List, Dict, Any
from datetime import datetime
import json

class CallAnalytics:
    """Process and analyze call session data"""
    
    @staticmethod
    def calculate_metrics(
        duration: int,
        message_count: int,
        transcript: List[Dict[str, str]],
        language: str
    ) -> Dict[str, Any]:
        """
        Calculate call metrics and statistics
        
        Args:
            duration: Call duration in seconds
            message_count: Total messages exchanged
            transcript: List of message exchanges
            language: Primary language used
        
        Returns:
            Dictionary of analytics metrics
        """
        
        user_messages = [m for m in transcript if m["role"] == "user"]
        assistant_messages = [m for m in transcript if m["role"] == "assistant"]
        
        avg_user_length = (
            sum(len(m["content"].split()) for m in user_messages) / len(user_messages)
            if user_messages else 0
        )
        
        avg_assistant_length = (
            sum(len(m["content"].split()) for m in assistant_messages) / len(assistant_messages)
            if assistant_messages else 0
        )
        
        return {
            "duration_seconds": duration,
            "duration_formatted": f"{duration // 60}m {duration % 60}s",
            "total_exchanges": len(user_messages),
            "user_messages": len(user_messages),
            "assistant_messages": len(assistant_messages),
            "avg_user_message_length": round(avg_user_length, 2),
            "avg_assistant_message_length": round(avg_assistant_length, 2),
            "primary_language": language,
            "timestamp": datetime.now().isoformat(),
            "completion_status": "completed" if duration > 0 else "abandoned"
        }
    
    @staticmethod
    def generate_summary(
        call_data: Dict[str, Any],
        metrics: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Generate comprehensive call summary
        
        Args:
            call_data: Raw call data from frontend
            metrics: Calculated metrics
        
        Returns:
            Complete call summary for storage
        """
        
        return {
            "sessionId": call_data.get("sessionId"),
            "metadata": {
                "duration": metrics["duration_seconds"],
                "duration_formatted": metrics["duration_formatted"],
                "language": metrics["primary_language"],
                "timestamp": metrics["timestamp"],
                "status": metrics["completion_status"]
            },
            "conversation": {
                "total_exchanges": metrics["total_exchanges"],
                "user_messages": metrics["user_messages"],
                "assistant_messages": metrics["assistant_messages"],
                "transcript": call_data.get("transcript", [])
            },
            "audio": {
                "recording_saved": call_data.get("recordingSaved", False),
                "recording_path": call_data.get("recordingPath"),
                "format": "webm"
            },
            "statistics": {
                "avg_user_message_length": metrics["avg_user_message_length"],
                "avg_assistant_message_length": metrics["avg_assistant_message_length"]
            }
        }


class SessionStorage:
    """Handle session data persistence"""
    
    @staticmethod
    def save_session(session_data: Dict[str, Any], filepath: str = None) -> str:
        """
        Save session data to JSON file
        
        Args:
            session_data: Session summary data
            filepath: Optional custom filepath
        
        Returns:
            Path to saved file
        """
        
        if not filepath:
            session_id = session_data.get("sessionId", "unknown")
            filepath = f"sessions/{session_id}.json"
        
        # Ensure directory exists
        import os
        os.makedirs(os.path.dirname(filepath), exist_ok=True)
        
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(session_data, f, indent=2, ensure_ascii=False)
        
        return filepath
    
    @staticmethod
    def load_session(session_id: str, filepath: str = None) -> Dict[str, Any]:
        """
        Load session data from file
        
        Args:
            session_id: Session identifier
            filepath: Optional custom filepath
        
        Returns:
            Session data dictionary
        """
        
        if not filepath:
            filepath = f"sessions/{session_id}.json"
        
        with open(filepath, 'r', encoding='utf-8') as f:
            return json.load(f)
