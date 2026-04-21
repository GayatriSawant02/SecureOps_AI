#!/usr/bin/env python3
"""
Secure-Ops.AI Development Environment Setup Script

This script sets up the complete development environment for Secure-Ops.AI,
including virtual environment, dependencies, and initial configuration.
"""

import os
import sys
import subprocess
import shutil
from pathlib import Path

def run_command(command, cwd=None, check=True):
    """Run a shell command and return the result."""
    try:
        result = subprocess.run(
            command,
            shell=True,
            cwd=cwd,
            capture_output=True,
            text=True,
            check=check
        )
        return result.returncode == 0, result.stdout, result.stderr
    except subprocess.CalledProcessError as e:
        return False, e.stdout, e.stderr

def print_step(step, message):
    """Print a formatted step message."""
    print(f"\n🔧 {step}: {message}")

def print_success(message):
    """Print a success message."""
    print(f"✅ {message}")

def print_error(message):
    """Print an error message."""
    print(f"❌ {message}")

def check_prerequisites():
    """Check if all prerequisites are installed."""
    print_step("Prerequisites", "Checking system requirements...")

    # Check Python version
    python_version = sys.version_info
    if python_version < (3, 8):
        print_error(f"Python 3.8+ required. Found {python_version.major}.{python_version.minor}")
        return False
    print_success(f"Python {python_version.major}.{python_version.minor} found")

    # Check Node.js
    success, stdout, stderr = run_command("node --version")
    if not success:
        print_error("Node.js not found. Please install Node.js 16+")
        return False
    node_version = stdout.strip().lstrip('v').split('.')[0]
    if int(node_version) < 16:
        print_error(f"Node.js 16+ required. Found {stdout.strip()}")
        return False
    print_success(f"Node.js {stdout.strip()} found")

    # Check npm
    success, stdout, stderr = run_command("npm --version")
    if not success:
        print_error("npm not found")
        return False
    print_success(f"npm {stdout.strip()} found")

    return True

def setup_backend():
    """Set up the backend environment."""
    print_step("Backend Setup", "Setting up Python virtual environment...")

    backend_dir = Path("Backend")
    if not backend_dir.exists():
        print_error("Backend directory not found")
        return False

    # Create virtual environment
    if not Path(".venv").exists():
        print("Creating virtual environment...")
        success, stdout, stderr = run_command("python -m venv .venv")
        if not success:
            print_error(f"Failed to create virtual environment: {stderr}")
            return False
        print_success("Virtual environment created")

    # Activate virtual environment and install dependencies
    print("Installing Python dependencies...")
    if sys.platform == "win32":
        activate_cmd = ".venv\\Scripts\\activate"
        pip_cmd = ".venv\\Scripts\\pip"
    else:
        activate_cmd = "source .venv/bin/activate"
        pip_cmd = ".venv/bin/pip"

    # Install requirements
    success, stdout, stderr = run_command(f"{pip_cmd} install -r Backend/requirements.txt")
    if not success:
        print_error(f"Failed to install Python dependencies: {stderr}")
        return False
    print_success("Python dependencies installed")

    return True

def setup_frontend():
    """Set up the frontend environment."""
    print_step("Frontend Setup", "Setting up Node.js environment...")

    frontend_dir = Path("frontend")
    if not frontend_dir.exists():
        print_error("Frontend directory not found")
        return False

    # Install npm dependencies
    print("Installing Node.js dependencies...")
    success, stdout, stderr = run_command("npm install", cwd=frontend_dir)
    if not success:
        print_error(f"Failed to install Node.js dependencies: {stderr}")
        return False
    print_success("Node.js dependencies installed")

    # Check for vulnerabilities
    print("Checking for npm vulnerabilities...")
    success, stdout, stderr = run_command("npm audit", cwd=frontend_dir, check=False)
    if "vulnerabilities" in stdout.lower():
        print("⚠️  npm vulnerabilities found. Run 'npm audit fix' to fix them.")
    else:
        print_success("No npm vulnerabilities found")

    return True

def setup_environment():
    """Set up environment configuration."""
    print_step("Environment Setup", "Configuring environment variables...")

    env_example = Path(".env.example")
    env_file = Path(".env")

    if not env_example.exists():
        print_error(".env.example file not found")
        return False

    if not env_file.exists():
        print("Creating .env file from template...")
        shutil.copy(env_example, env_file)
        print_success(".env file created. Please edit it with your configuration.")
    else:
        print_success(".env file already exists")

    return True

def setup_database():
    """Set up the database."""
    print_step("Database Setup", "Initializing database...")

    # Check if we should use Docker or local database
    use_docker = input("Use Docker for database? (y/n) [n]: ").lower().strip() == 'y'

    if use_docker:
        print("Make sure Docker is running, then run: docker-compose up -d db")
        return True

    # Initialize local database
    print("Initializing local database...")
    if sys.platform == "win32":
        python_cmd = ".venv\\Scripts\\python"
    else:
        python_cmd = ".venv/bin/python"

    success, stdout, stderr = run_command(f"{python_cmd} -m Backend.init_db")
    if not success:
        print_error(f"Failed to initialize database: {stderr}")
        return False
    print_success("Database initialized")

    return True

def main():
    """Main setup function."""
    print("🚀 Secure-Ops.AI Development Environment Setup")
    print("=" * 50)

    # Check prerequisites
    if not check_prerequisites():
        print_error("Prerequisites check failed. Please install missing dependencies.")
        sys.exit(1)

    # Setup components
    success = True
    success &= setup_backend()
    success &= setup_frontend()
    success &= setup_environment()
    success &= setup_database()

    if success:
        print("\n" + "=" * 50)
        print_success("Setup completed successfully!")
        print("\n📋 Next steps:")
        print("1. Edit .env file with your configuration")
        print("2. Start the backend: python -m Backend.main")
        print("3. Start the frontend: cd frontend && npm start")
        print("4. Open http://localhost:3000 in your browser")
        print("\n📚 For more information, see README.md")
    else:
        print_error("Setup failed. Please check the errors above.")
        sys.exit(1)

if __name__ == "__main__":
    main()