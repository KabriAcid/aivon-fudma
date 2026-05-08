"""
Language utilities for multilingual support
"""

from typing import Dict, List

LANGUAGE_CODES = {
    "english": {"code": "en-US", "name": "English", "region": "US"},
    "hausa": {"code": "ha-NG", "name": "Hausa", "region": "Nigeria"},
    "arabic": {"code": "ar-SA", "name": "Arabic", "region": "Saudi Arabia"}
}

LANGUAGE_PROMPTS = {
    "english": {
        "greeting": "Welcome to Federal University Dutsin-Ma Voice Assistant. How can I help you today?",
        "error": "I'm sorry, I couldn't process that. Could you please try again?",
        "goodbye": "Thank you for using Aivon. Goodbye!",
        "menu": "To continue in Hausa, press 1. For Arabic, press 2. How can I assist you?"
    },
    "hausa": {
        "greeting": "Barka da zuwa mataimakin muryar Jami'ar Dutsin-Ma. Ta yaya zan iya taimaka muku?",
        "error": "Yi hakuri, ban iya aiki da haka ba. Zai yi iko in sake yin yunwa?",
        "goodbye": "Gobarci don yin aiki da Aivon. Jiya!",
        "menu": "Don ci gaba da Hausa, danna daya. Domin Larabci, danna biyu. Ta yaya zan iya taimaka muku?"
    },
    "arabic": {
        "greeting": "مرحباً بكم في مساعد جامعة FUDMA الصوتي. كيف يمكنني مساعدتكم؟",
        "error": "آسف، لم أتمكن من معالجة ذلك. هل يمكنك المحاولة مرة أخرى؟",
        "goodbye": "شكراً لاستخدام Aivon. وداعاً!",
        "menu": "للمتابعة بالهاوسا، اضغط 1. بالعربية، اضغط 2. كيف يمكنني مساعدتكم؟"
    }
}


def get_language_info(language: str) -> Dict:
    """Get language metadata"""
    return LANGUAGE_CODES.get(language, LANGUAGE_CODES["english"])


def get_language_prompt(language: str, prompt_type: str = "greeting") -> str:
    """Get predefined prompt in specified language"""
    return LANGUAGE_PROMPTS.get(language, LANGUAGE_PROMPTS["english"]).get(
        prompt_type, ""
    )


def is_supported_language(language: str) -> bool:
    """Check if language is supported"""
    return language.lower() in LANGUAGE_CODES


def get_supported_languages() -> List[str]:
    """Get list of supported languages"""
    return list(LANGUAGE_CODES.keys())


class LanguageDetector:
    """Detect user language from text (basic implementation)"""
    
    # Simple keyword detection for demo purposes
    HAUSA_KEYWORDS = {"ba", "da", "ne", "nan", "don", "za", "ko", "an", "ce", "ya"}
    ARABIC_KEYWORDS = {"و", "في", "ال", "من", "إلى", "هذا", "ذلك", "كيف", "ما"}
    
    @classmethod
    def detect_language(cls, text: str) -> str:
        """
        Basic language detection
        Returns: language code (english, hausa, arabic)
        """
        
        if not text:
            return "english"
        
        text_lower = text.lower()
        
        # Count Arabic characters
        arabic_count = sum(1 for c in text if ord(c) >= 1536 and ord(c) <= 1791)
        if arabic_count > len(text) * 0.3:
            return "arabic"
        
        # Count Hausa keywords
        hausa_count = sum(1 for word in text_lower.split() if word in cls.HAUSA_KEYWORDS)
        if hausa_count > len(text_lower.split()) * 0.2:
            return "hausa"
        
        return "english"
