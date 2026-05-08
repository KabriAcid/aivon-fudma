#!/bin/bash
# Aivon - Full Stack Startup Script (macOS/Linux)

echo ""
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║          AIVON - AI Voice Assistant Startup              ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js first."
    exit 1
fi

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python not found. Please install Python first."
    exit 1
fi

echo "✅ Node.js and Python detected."
echo ""

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found. Please create one from .env.example"
    echo "   Command: cp .env.example .env"
    echo ""
    exit 1
fi

# Check for required API key
if ! grep -q "GEMINI_API_KEY=" .env; then
    echo "❌ GEMINI_API_KEY not set in .env file"
    exit 1
fi

echo "📦 Installing dependencies..."
echo ""

# Install Node dependencies if needed
if [ ! -d node_modules ]; then
    echo "Installing Node.js packages..."
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ npm install failed"
        exit 1
    fi
fi

# Setup Python virtual environment if needed
if [ ! -d venv ]; then
    echo "Setting up Python virtual environment..."
    python3 -m venv venv
    source venv/bin/activate
    pip install -r requirements.txt
    if [ $? -ne 0 ]; then
        echo "❌ pip install failed"
        exit 1
    fi
else
    source venv/bin/activate
fi

echo ""
echo "✅ Dependencies ready!"
echo ""
echo "🚀 Starting services..."
echo ""
echo "   • Node.js Backend:  http://localhost:3000"
echo "   • Frontend Vite:    http://localhost:5173 (auto)"
echo "   • Python Service:   http://localhost:5000 (optional)"
echo ""
echo "Press CTRL+C to stop the server."
echo ""

# Start Node.js server
echo "Starting Node.js backend..."
npm run dev
