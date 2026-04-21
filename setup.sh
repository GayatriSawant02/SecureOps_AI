#!/bin/bash
# Secure-Ops.AI Development Setup Script (Unix/Linux/macOS)

set -e

echo "🚀 Secure-Ops.AI Development Environment Setup"
echo "=============================================="

# Check prerequisites
echo ""
echo "🔧 Checking prerequisites..."

# Check Python
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 not found. Please install Python 3.8+"
    exit 1
fi

PYTHON_VERSION=$(python3 -c 'import sys; print(".".join(map(str, sys.version_info[:2])))')
if python3 -c "import sys; sys.exit(0 if sys.version_info >= (3, 8) else 1)"; then
    echo "✅ Python $PYTHON_VERSION found"
else
    echo "❌ Python 3.8+ required. Found $PYTHON_VERSION"
    exit 1
fi

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js 16+"
    exit 1
fi

NODE_VERSION=$(node -v | sed 's/v//')
if [ "$(printf '%s\n' "$NODE_VERSION" "16.0.0" | sort -V | head -n1)" = "16.0.0" ]; then
    echo "✅ Node.js $NODE_VERSION found"
else
    echo "❌ Node.js 16+ required. Found $NODE_VERSION"
    exit 1
fi

# Check npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm not found"
    exit 1
fi
echo "✅ npm $(npm -v) found"

# Setup backend
echo ""
echo "🔧 Setting up backend..."

# Create virtual environment
if [ ! -d ".venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv .venv
    echo "✅ Virtual environment created"
fi

# Activate virtual environment and install dependencies
echo "Installing Python dependencies..."
./.venv/bin/pip install --upgrade pip
./.venv/bin/pip install -r Backend/requirements.txt
echo "✅ Python dependencies installed"

# Setup frontend
echo ""
echo "🔧 Setting up frontend..."

cd frontend
echo "Installing Node.js dependencies..."
npm install

echo "Checking for vulnerabilities..."
if npm audit --audit-level moderate | grep -q "vulnerabilities"; then
    echo "⚠️  npm vulnerabilities found. Run 'npm audit fix' to fix them."
else
    echo "✅ No npm vulnerabilities found"
fi

cd ..

# Setup environment
echo ""
echo "🔧 Setting up environment..."

if [ ! -f ".env" ]; then
    if [ -f ".env.example" ]; then
        cp .env.example .env
        echo "✅ .env file created from template"
        echo "⚠️  Please edit .env file with your configuration"
    else
        echo "❌ .env.example file not found"
        exit 1
    fi
else
    echo "✅ .env file already exists"
fi

# Setup database
echo ""
echo "🔧 Setting up database..."

read -p "Use Docker for database? (y/n) [n]: " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Make sure Docker is running, then run: docker-compose up -d db"
else
    echo "Initializing local database..."
    ./.venv/bin/python -m Backend.init_db
    echo "✅ Database initialized"
fi

echo ""
echo "=============================================="
echo "✅ Setup completed successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Edit .env file with your configuration"
echo "2. Start the backend: python -m Backend.main"
echo "3. Start the frontend: cd frontend && npm start"
echo "4. Open http://localhost:3000 in your browser"
echo ""
echo "📚 For more information, see README.md"
echo ""
echo "🚀 Happy coding!"