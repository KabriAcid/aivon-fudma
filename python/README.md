# Aivon Python Services

Advanced AI processing and utilities for the Aivon voice assistant system.

## Structure

```
python/
├── __init__.py
├── gemini_service.py      # Direct Gemini API integration
├── analytics.py            # Call analytics and session processing
├── language_utils.py       # Multilingual support utilities
├── app.py                  # Flask microservice (optional)
└── README.md
```

## Setup

### 1. Create Virtual Environment

```bash
python -m venv venv
venv\Scripts\activate  # Windows
source venv/bin/activate  # macOS/Linux
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Environment Configuration

Create `.env` file or copy from `.env.example`:

```env
GEMINI_API_KEY=your_key_here
PYTHON_PORT=5000
FLASK_ENV=development
```

## Modules

### `gemini_service.py`

Direct Gemini API integration with caching support.

```python
from python.gemini_service import get_gemini_service

service = get_gemini_service()
response = service.generate_response(
    text="What are the admission requirements?",
    language="english"
)
print(response)
```

### `analytics.py`

Call analytics and session data processing.

```python
from python.analytics import CallAnalytics, SessionStorage

metrics = CallAnalytics.calculate_metrics(
    duration=245,
    message_count=5,
    transcript=[...],
    language="english"
)

summary = CallAnalytics.generate_summary(call_data, metrics)
SessionStorage.save_session(summary)
```

### `language_utils.py`

Multilingual support utilities.

```python
from python.language_utils import LanguageDetector, get_language_prompt

# Detect language
lang = LanguageDetector.detect_language("Sannu da zuwa")  # "hausa"

# Get predefined prompts
prompt = get_language_prompt("hausa", "greeting")
```

### `app.py`

Flask microservice for advanced processing (optional, runs on port 5000).

```bash
python python/app.py
```

**Available endpoints:**

- `GET /health` - Health check
- `POST /api/analyze` - Text analysis and language detection
- `POST /api/generate-response` - AI response generation
- `POST /api/session-summary` - Generate call summary
- `GET /api/language-prompt/<type>/<language>` - Get predefined prompts

## Integration with Node.js Backend

### Option 1: Python-Only AI Processing

Node.js handles all requests and calls Python service:

```
React → Express /api/chat → Python /api/generate-response → Gemini
```

### Option 2: Direct Node.js Integration

Node.js calls Gemini directly (current setup):

```
React → Express /api/chat → Gemini
```

## Development

### Running Tests

```bash
python -m pytest tests/
```

### Linting

```bash
flake8 python/
```

### Type Checking

```bash
mypy python/
```

## Notes

- All responses respect language specifications in prompts
- Hausa language detection uses keyword matching
- Arabic detected via Unicode character ranges
- Sessions saved to `sessions/` directory as JSON
- Recording files stored in `recordings/` directory

## Future Enhancements

- [ ] Session database integration (PostgreSQL)
- [ ] Advanced NLP analysis
- [ ] Sentiment analysis
- [ ] Call quality metrics
- [ ] Real-time analytics dashboard
- [ ] Fine-tuned prompts per user profile

---

**Version:** 1.0  
**Status:** Production-Ready
