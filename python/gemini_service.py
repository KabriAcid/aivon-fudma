"""
Gemini AI Service Module
Handles direct interactions with Google Gemini API
"""

import os
from dotenv import load_dotenv
import google.generativeai as genai
from typing import Optional

load_dotenv()

class GeminiService:
    """Service for interacting with Google Gemini API"""
    
    def __init__(self):
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            raise ValueError("GEMINI_API_KEY environment variable not set")
        
        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel("gemini-1.5-flash")
    
    def generate_response(
        self, 
        text: str, 
        language: str = "english",
        system_instruction: Optional[str] = None
    ) -> str:
        """
        Generate AI response for user input
        
        Args:
            text: User input text
            language: Response language (english, hausa, arabic)
            system_instruction: Custom system prompt
        
        Returns:
            AI-generated response text
        """
        
        if not system_instruction:
            system_instruction = f"""
You are Aivon (AI Voice of Network), a premium AI telecom assistant for the Federal University Dutsin-Ma (FUDMA).
Your goal is to assist students with their academic and administrative queries.
Current Language: {language}.
If language is hausa, respond strictly in Hausa.
If language is english, respond strictly in English.
If language is arabic, respond strictly in Arabic.
Be concise, supportive, and professional.
Focus on student registration, courses, campus life, and general inquiries.
            """
        
        try:
            response = self.model.generate_content(
                text,
                safety_settings=[
                    {
                        "category": "HARM_CATEGORY_UNSPECIFIED",
                        "threshold": "BLOCK_NONE"
                    }
                ]
            )
            
            return response.text if response.text else "I'm sorry, I couldn't process that."
        
        except Exception as e:
            print(f"Error generating response: {e}")
            raise
    
    def stream_response(self, text: str, language: str = "english"):
        """
        Stream AI response for real-time consumption
        
        Args:
            text: User input text
            language: Response language
        
        Yields:
            Response text chunks
        """
        
        system_instruction = f"""
You are Aivon (AI Voice of Network), a premium AI telecom assistant for the Federal University Dutsin-Ma (FUDMA).
Your goal is to assist students with their academic and administrative queries.
Current Language: {language}.
If language is hausa, respond strictly in Hausa.
If language is english, respond strictly in English.
If language is arabic, respond strictly in Arabic.
Be concise, supportive, and professional.
Focus on student registration, courses, campus life, and general inquiries.
        """
        
        try:
            response = self.model.generate_content(
                text,
                stream=True
            )
            
            for chunk in response:
                if chunk.text:
                    yield chunk.text
        
        except Exception as e:
            print(f"Error streaming response: {e}")
            raise


# Singleton instance
_service = None

def get_gemini_service() -> GeminiService:
    """Get or create Gemini service instance"""
    global _service
    if _service is None:
        _service = GeminiService()
    return _service
