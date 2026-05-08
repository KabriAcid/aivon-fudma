@echo off
REM Aivon - Full Stack Startup Script (Windows)

echo.
echo ╔═══════════════════════════════════════════════════════════╗
echo ║          AIVON - AI Voice Assistant Startup              ║
echo ╚═══════════════════════════════════════════════════════════╝
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js not found. Please install Node.js first.
    exit /b 1
)

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python not found. Please install Python first.
    exit /b 1
)

echo ✅ Node.js and Python detected.
echo.

REM Check if .env file exists
if not exist .env (
    echo ⚠️  .env file not found. Please create one from .env.example
    echo    Command: copy .env.example .env
    echo.
    pause
    exit /b 1
)

REM Check for required API key
findstr /M "GEMINI_API_KEY=" .env >nul
if errorlevel 1 (
    echo ❌ GEMINI_API_KEY not set in .env file
    exit /b 1
)

echo 📦 Installing dependencies...
echo.

REM Install Node dependencies if needed
if not exist node_modules (
    echo Installing Node.js packages...
    call npm install
    if errorlevel 1 (
        echo ❌ npm install failed
        exit /b 1
    )
)

REM Setup Python virtual environment if needed
if not exist venv (
    echo Setting up Python virtual environment...
    python -m venv venv
    call .\venv\Scripts\activate.bat
    pip install -r requirements.txt
    if errorlevel 1 (
        echo ❌ pip install failed
        exit /b 1
    )
) else (
    call .\venv\Scripts\activate.bat
)

echo.
echo ✅ Dependencies ready!
echo.
echo 🚀 Starting services...
echo.
echo   • Node.js Backend:  http://localhost:3000
echo   • Frontend Vite:    http://localhost:5173 (auto)
echo   • Python Service:   http://localhost:5000 (optional)
echo.
echo Press CTRL+C to stop the server.
echo.

REM Start Node.js server
echo Starting Node.js backend...
call npm run dev

pause
