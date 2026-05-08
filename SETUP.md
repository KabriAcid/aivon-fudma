# Setup & Installation Guide

## ⚡ Quick Start

### 1. Prerequisites

- **Node.js 18+** ([Download](https://nodejs.org/))
- **Python 3.10+** ([Download](https://python.org/))
- **Google Gemini API Key** ([Get free key](https://ai.google.dev/))

### 2. Environment Setup

```bash
# Copy environment template
cp .env.example .env

# Edit .env and add your Gemini API key
# GEMINI_API_KEY=your_key_here_without_quotes
```

### 3. Install Dependencies

**Windows:**

```bash
start.bat
```

**macOS/Linux:**

```bash
chmod +x start.sh
./start.sh
```

### 4. Manual Setup (if scripts don't work)

**Install Node dependencies:**

```bash
npm install
```

**Setup Python environment:**

```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
.\venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install Python packages
pip install -r requirements.txt
```

### 5. Run Development Server

```bash
# Start Express backend + Vite frontend
npm run dev
```

**Services will be available at:**

- Frontend: http://localhost:5173 (Vite auto-open)
- Backend: http://localhost:3000
- Health Check: http://localhost:3000/api/health

---

## 🧑‍💻 Development Workflow

### Frontend Only (Vite)

```bash
npm run dev
# Automatically opens browser with HMR (hot reload)
```

### Backend Only (Express)

```bash
npm run dev
# Just the Express server on port 3000
```

### Python Service (Optional)

```bash
# Activate venv first
.\venv\Scripts\activate  # Windows
source venv/bin/activate  # macOS/Linux

# Run Flask microservice
python python/app.py
# Available on http://localhost:5000
```

### Linting & Building

```bash
# Type check
npm run lint

# Build for production
npm run build

# Start production server
npm start
```

---

## 🐍 Python Modules

### Using Gemini Service Directly

```python
from python.gemini_service import get_gemini_service

service = get_gemini_service()
response = service.generate_response(
    text="Hello, how are you?",
    language="english"
)
print(response)
```

### Call Analytics

```python
from python.analytics import CallAnalytics, SessionStorage

# Calculate metrics from call data
metrics = CallAnalytics.calculate_metrics(
    duration=120,
    message_count=5,
    transcript=[...],
    language="english"
)

# Generate and save summary
summary = CallAnalytics.generate_summary(call_data, metrics)
SessionStorage.save_session(summary)
```

### Language Detection

```python
from python.language_utils import LanguageDetector, get_language_prompt

# Auto-detect language
lang = LanguageDetector.detect_language("Sannu da zuwa FUDMA")
# Returns: "hausa"

# Get predefined prompts
greeting = get_language_prompt("hausa", "greeting")
```

---

## 🗄️ Database Setup (Prisma)

### Initialize Database

```bash
# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# View database (GUI)
npx prisma studio
```

### Connection String

Set in `.env`:

```env
DATABASE_URL="file:./dev.db"
```

For PostgreSQL:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/aivon"
```

---

## 🔍 Troubleshooting

### Port Already in Use

**Windows:**

```powershell
# Find process using port 3000
netstat -ano | findstr :3000

# Kill process (replace PID)
taskkill /PID <PID> /F
```

**macOS/Linux:**

```bash
# Find process
lsof -ti:3000

# Kill process
kill -9 $(lsof -ti:3000)
```

### Python Virtual Environment Issues

```bash
# Fully reset venv
rm -rf venv
python -m venv venv

# Windows:
.\venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

pip install -r requirements.txt
```

### API Key Not Found

```bash
# Verify .env exists in project root
ls -la .env

# Check it has the API key
grep GEMINI_API_KEY .env

# Should output: GEMINI_API_KEY=your_actual_key
```

### Vite Not Starting

```bash
# Clear cache
rm -rf node_modules/.vite

# Reinstall deps
npm install

# Restart
npm run dev
```

---

## 📦 Dependency Management

### Add Node Package

```bash
npm install package-name
npm install --save-dev dev-package
```

### Add Python Package

```bash
# With venv activated:
pip install package-name

# Update requirements.txt
pip freeze > requirements.txt
```

### Update Dependencies

```bash
# Node
npm update
npm outdated  # Check for updates

# Python
pip list --outdated
pip install --upgrade package-name
```

---

## 🚀 Production Deployment

### Build

```bash
npm run build
# Creates optimized build in ./dist
```

### Environment Variables

Create `.env.production`:

```env
GEMINI_API_KEY=your_prod_key
NODE_ENV=production
DATABASE_URL=your_prod_db_url
```

### Run Production

```bash
npm start
# Serves from ./dist on port 3000
```

### Docker (Optional)

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

Build and run:

```bash
docker build -t aivon .
docker run -p 3000:3000 --env-file .env aivon
```

---

## 🧪 Testing

### Frontend Tests (Future)

```bash
npm run test
```

### Python Tests (Future)

```bash
# With venv activated
pytest tests/
```

---

## 📚 Documentation

- **Architecture**: See [ARCHITECTURE.md](ARCHITECTURE.md)
- **Frontend Components**: `src/components/`
- **Backend APIs**: `server.ts`
- **Python Modules**: `python/README.md`

---

## 🤝 Contributing

1. Create feature branch: `git checkout -b feature/my-feature`
2. Make changes and test
3. Commit: `git commit -m "feat: description"`
4. Push: `git push origin feature/my-feature`
5. Open pull request

---

## 📞 Support

For issues or questions:

1. Check troubleshooting section above
2. Review [ARCHITECTURE.md](ARCHITECTURE.md)
3. Check terminal output for error messages
4. Ensure all prerequisites are installed

---

**Last Updated:** May 8, 2026  
**Version:** 1.0
