#!/bin/bash
# Chat LLM WebUI - One-click startup script

echo "🚀 Starting Chat LLM WebUI..."
echo ""

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python3 not found, please install Python3 first"
    exit 1
fi

# Install dependencies if not installed
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
    source venv/bin/activate
    echo "🔧 Installing dependencies..."
    pip install -r requirements.txt
else
    source venv/bin/activate
fi

echo ""
echo "✅ Starting server..."
echo "🌐 Open http://localhost:5000 in your browser to use"
echo ""

python3 app.py
