# Secure-Ops.AI 🛡️

> **Enterprise-Grade Security Operations Dashboard** - AI-powered log analysis and threat detection platform

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python 3.8+](https://img.shields.io/badge/python-3.8+-blue.svg)](https://www.python.org/downloads/)
[![React 19](https://img.shields.io/badge/react-19-61dafb.svg)](https://reactjs.org/)
[![Flask](https://img.shields.io/badge/flask-3.1+-000000.svg)](https://flask.palletsprojects.com/)

A comprehensive security operations platform that combines advanced log analysis, machine learning-based anomaly detection, and AI-powered insights to help security teams identify and respond to threats in real-time.

## ✨ Features

### 🔍 **Advanced Log Analysis**

- **Multi-format Support**: Parse and analyze `.log`, `.txt`, and custom log formats
- **Real-time Processing**: Upload and analyze logs with instant results
- **Drag-and-drop Interface**: Intuitive file upload with validation
- **Progress Tracking**: Real-time analysis progress indicators

### 🧠 **AI-Powered Intelligence**

- **Google Generative AI Integration**: Intelligent threat summaries and recommendations
- **ML-Based Anomaly Detection**: Statistical analysis for unusual patterns
- **Context-Aware Chatbot**: AI assistant for security operations
- **Automated Insights**: AI-generated remediation suggestions

### 📊 **Interactive Dashboards**

- **Real-time Visualization**: Live threat monitoring with interactive charts
- **Multiple Chart Types**: Pie charts, bar charts, line charts, and area charts
- **Threat Severity Analysis**: Visual breakdown of security incidents
- **Timeline Correlation**: Network traffic and threat activity correlation

### 🔐 **Enterprise Security**

- **JWT Authentication**: Secure token-based user authentication
- **Role-Based Access**: Admin and Analyst user roles
- **Session Management**: Secure session handling with auto-expiration
- **API Protection**: Authentication-required endpoints

### 🗄️ **Data Persistence**

- **Database Integration**: PostgreSQL/SQLite for data storage
- **Analysis History**: Store and retrieve past analysis results
- **User Management**: Persistent user accounts and sessions
- **Audit Logging**: Comprehensive security event logging

## 🛠️ Tech Stack

### Backend

- **Python 3.8+** - Core language
- **Flask** - REST API framework
- **Flask-JWT-Extended** - JWT authentication
- **SQLAlchemy** - Database ORM
- **Google Generative AI** - AI-powered insights
- **bcrypt** - Password hashing

### Frontend

- **React 19** - Modern UI framework
- **React Router** - Client-side routing
- **Tailwind CSS** - Utility-first styling
- **Recharts** - Data visualization
- **Framer Motion** - Smooth animations
- **Lucide React** - Beautiful icons

### Database

- **PostgreSQL** - Primary database (production)
- **SQLite** - Development database
- **Alembic** - Database migrations

### DevOps

- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration
- **Nginx** - Reverse proxy (production)

## 📋 Prerequisites

- **Python 3.8+**
- **Node.js 16+**
- **Docker & Docker Compose** (optional)
- **PostgreSQL** (optional, SQLite for development)

## 🚀 Quick Start

### Option 1: Docker (Recommended)

```bash
# Clone the repository
git clone https://github.com/yourusername/secure-ops-ai.git
cd secure-ops-ai

# Start all services
docker-compose up -d

# Access the application
# Frontend: http://localhost:3000
# Backend API: http://localhost:8000
# Database: localhost:5432
```

### Option 2: Local Development

#### 1. Backend Setup

```bash
# Navigate to project root
cd secure-ops-ai

# Create and activate virtual environment
python -m venv .venv
source .venv/Scripts/activate  # Windows
# or
source .venv/bin/activate     # Linux/Mac

# Install Python dependencies
pip install -r Backend/requirements.txt

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Initialize database
python -m Backend.init_db

# Start the backend server
python -m Backend.main
```

#### 2. Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start the development server
npm start
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the project root:

```env
# Flask Configuration
FLASK_ENV=development
SECRET_KEY=your-secret-key-change-in-production

# JWT Configuration
JWT_SECRET_KEY=your-jwt-secret-key

# Database Configuration
DATABASE_URL=postgresql://user:password@localhost:5432/secureops
# or for SQLite (development)
DATABASE_URL=sqlite:///secureops.db

# AI Configuration (Optional)
GOOGLE_API_KEY=your-google-generative-ai-api-key

# CORS Configuration
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
```

### Default Test Accounts

- **Admin**: `admin@secureops.ai` / `admin123`
- **Analyst**: `analyst@secureops.ai` / `analyst123`

## 📁 Project Structure

```
secure-ops-ai/
├── ai_analysis/              # AI and ML analysis modules
│   ├── analyzer.py          # Main analysis orchestrator
│   ├── log_parser.py        # Log parsing utilities
│   ├── threat_detector.py   # ML-based threat detection
│   ├── summarizer.py        # Result summarization
│   ├── rules.py            # Detection rules and thresholds
│   ├── google_ai.py        # Google AI integration
│   └── utils.py            # Helper utilities
├── Backend/                 # Flask backend application
│   ├── __init__.py         # Package initialization
│   ├── main.py             # Application entry point
│   ├── routes.py           # API endpoints
│   ├── config.py           # Configuration settings
│   ├── auth.py             # Authentication module
│   ├── models.py           # Database models
│   ├── analyzer.py         # Analysis wrapper
│   ├── file_handler.py     # File upload handling
│   └── requirements.txt    # Python dependencies
├── frontend/                # React frontend application
│   ├── public/             # Static assets
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   ├── context/        # React context providers
│   │   └── utils/          # Frontend utilities
│   ├── package.json        # Node dependencies
│   └── tailwind.config.js  # Tailwind configuration
├── docker/                  # Docker configuration
│   ├── Dockerfile.backend   # Backend container config
│   ├── Dockerfile.frontend  # Frontend container config
│   └── nginx.conf          # Nginx configuration
├── .env.example            # Environment template
├── docker-compose.yml      # Docker Compose configuration
├── setup.py               # Development setup script
└── README.md              # This file
```

## 🐳 Docker Deployment

### Development

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Production

```bash
# Build for production
docker-compose -f docker-compose.prod.yml up -d

# Scale services
docker-compose up -d --scale backend=3
```

## 🔍 API Documentation

### Authentication Endpoints

```http
POST /auth/login
POST /auth/signup
GET  /auth/me
```

### Analysis Endpoints

```http
POST /upload          # Upload and analyze log files
POST /analyze         # Analyze text directly
POST /chat           # AI chatbot interaction
```

### Data Endpoints

```http
GET  /api/analysis    # Get analysis history
GET  /api/threats     # Get threat data
POST /api/reports     # Generate reports
```

## 🧪 Testing

### Backend Tests

```bash
# Run all tests
python -m pytest

# Run with coverage
python -m pytest --cov=Backend --cov-report=html
```

### Frontend Tests

```bash
cd frontend
npm test
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Google Generative AI** for AI-powered insights
- **React & Flask communities** for excellent frameworks
- **Security researchers** for threat detection patterns

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/secure-ops-ai/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/secure-ops-ai/discussions)
- **Email**: support@secureops.ai

---

**Built with ❤️ for the cybersecurity community**
│ └── requirements.txt # Python dependencies
├── frontend/ # React frontend
│ ├── src/
│ │ ├── services/ # API service layer
│ │ ├── components/ # Reusable components
│ │ ├── pages/ # Page components
│ │ ├── context/ # React context
│ │ └── App.js # Main app component
│ └── package.json # Node dependencies
└── README.md # This file

````

## 🔧 API Endpoints

### Backend API (Flask)

- `GET /health` - Health check
- `POST /upload` - Upload and analyze log file
- `POST /analyze` - Analyze text directly

### Example API Usage

```bash
# Health check
curl http://localhost:8000/health

# Upload log file
curl -X POST -F "file=@/path/to/logfile.log" http://localhost:8000/upload

# Analyze text
curl -X POST -H "Content-Type: application/json" \
  -d '{"text":"log content here"}' \
  http://localhost:8000/analyze
````

## 🎯 Usage

1. **Start both backend and frontend servers** as described above
2. **Navigate to the frontend** at `http://localhost:3000`
3. **Go to the Logs page** in the dashboard
4. **Upload a log file** (.log or .txt) using the file upload interface
5. **View analysis results** including:
   - Log metrics (total lines, IPs, failed logins)
   - Threat detections
   - AI-powered insights and recommendations

## 🔍 Threat Detection Rules

The system detects various security threats based on configurable rules:

- **Brute Force**: 5+ failed login attempts from same IP
- **Invalid Users**: Attempts to login with non-existent usernames
- **Suspicious Patterns**: Various configurable security events

Rules can be modified in `ai_analysis/rules.py`.

## 🎨 Customization

### Styling

- Cyber-themed design with neon accents
- Fully responsive layout
- Custom Tailwind CSS configuration

### Configuration

- Backend settings in `Backend/config.py`
- Frontend API URL via environment variables
- Detection thresholds in `ai_analysis/rules.py`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📝 License

See LICENSE file for details.

## 👥 Author

Leena Rajeshirke

---

**Note**: This is a development/demo version. For production use, implement proper authentication, database storage, and security measures.
