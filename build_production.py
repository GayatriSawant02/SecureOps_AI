#!/usr/bin/env python3
"""
Production build and deployment script for Secure-Ops.AI
"""

import os
import sys
import subprocess
import logging
from pathlib import Path

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class ProductionBuilder:
    """Handles production build and deployment tasks"""

    def __init__(self):
        self.project_root = Path(__file__).parent
        self.backend_dir = self.project_root / "Backend"
        self.frontend_dir = self.project_root / "frontend"
        self.docker_dir = self.project_root / "docker"

    def run_command(self, command, cwd=None, check=True):
        """Run a shell command with proper error handling"""
        try:
            logger.info(f"Running: {command}")
            result = subprocess.run(
                command,
                shell=True,
                cwd=cwd or self.project_root,
                capture_output=True,
                text=True,
                check=check
            )
            if result.stdout:
                logger.info(result.stdout)
            return result
        except subprocess.CalledProcessError as e:
            logger.error(f"Command failed: {e}")
            if e.stdout:
                logger.error(e.stdout)
            if e.stderr:
                logger.error(e.stderr)
            if check:
                sys.exit(1)
            return e

    def check_prerequisites(self):
        """Check if all required tools are installed"""
        logger.info("Checking prerequisites...")

        required_commands = [
            "python3",
            "pip",
            "node",
            "npm",
            "docker",
            "docker-compose"
        ]

        missing = []
        for cmd in required_commands:
            if not self.run_command(f"which {cmd}", check=False).returncode == 0:
                missing.append(cmd)

        if missing:
            logger.error(f"Missing required commands: {', '.join(missing)}")
            logger.error("Please install the missing tools and try again.")
            sys.exit(1)

        logger.info("All prerequisites are installed.")

    def setup_backend_production(self):
        """Set up backend for production"""
        logger.info("Setting up backend for production...")

        # Install production dependencies
        self.run_command(
            "pip install -r requirements.txt",
            cwd=self.backend_dir
        )

        # Install dev dependencies for testing
        if (self.backend_dir / "requirements-dev.txt").exists():
            self.run_command(
                "pip install -r requirements-dev.txt",
                cwd=self.backend_dir
            )

        # Run backend tests
        logger.info("Running backend tests...")
        self.run_command(
            "python -m pytest tests/ -v --cov=Backend --cov-report=html",
            cwd=self.backend_dir
        )

        logger.info("Backend production setup complete.")

    def setup_frontend_production(self):
        """Set up frontend for production"""
        logger.info("Setting up frontend for production...")

        # Install dependencies
        self.run_command(
            "npm install",
            cwd=self.frontend_dir
        )

        # Run linting
        logger.info("Running frontend linting...")
        self.run_command(
            "npm run lint",
            cwd=self.frontend_dir
        )

        # Run tests
        logger.info("Running frontend tests...")
        self.run_command(
            "npm test -- --coverage --watchAll=false",
            cwd=self.frontend_dir
        )

        # Build for production
        logger.info("Building frontend for production...")
        self.run_command(
            "npm run build",
            cwd=self.frontend_dir
        )

        logger.info("Frontend production setup complete.")

    def build_docker_images(self):
        """Build Docker images for production"""
        logger.info("Building Docker images...")

        # Build backend image
        self.run_command(
            "docker build -f docker/Dockerfile.backend -t secureops-backend:latest ."
        )

        # Build frontend image
        self.run_command(
            "docker build -f docker/Dockerfile.frontend -t secureops-frontend:latest ."
        )

        # Build nginx image
        self.run_command(
            "docker build -f docker/Dockerfile.nginx -t secureops-nginx:latest docker/"
        )

        logger.info("Docker images built successfully.")

    def run_production_tests(self):
        """Run comprehensive production tests"""
        logger.info("Running production tests...")

        # Test Docker Compose setup
        logger.info("Testing Docker Compose configuration...")
        self.run_command("docker-compose config")

        # Start services for testing
        logger.info("Starting services for testing...")
        self.run_command("docker-compose up -d")

        try:
            # Wait for services to be healthy
            logger.info("Waiting for services to be healthy...")
            self.run_command("timeout 60 docker-compose exec -T backend python -c \"import requests; requests.get('http://localhost:8000/health')\"")

            # Run integration tests against running services
            logger.info("Running integration tests...")
            self.run_command(
                "python -m pytest Backend/tests/test_api_integration.py -v -m integration",
                cwd=self.project_root
            )

        finally:
            # Clean up
            logger.info("Stopping test services...")
            self.run_command("docker-compose down")

        logger.info("Production tests completed successfully.")

    def deploy_production(self):
        """Deploy to production environment"""
        logger.info("Deploying to production...")

        # Set production environment variables
        env_file = self.project_root / ".env.production"
        if not env_file.exists():
            logger.warning("Production environment file not found. Creating template...")
            self.create_production_env_template()

        # Deploy using Docker Compose
        logger.info("Starting production deployment...")
        self.run_command("docker-compose -f docker-compose.yml up -d --build")

        # Run health checks
        logger.info("Running post-deployment health checks...")
        self.run_command("docker-compose exec -T backend python -c \"import sys; sys.exit(0 if requests.get('http://localhost:8000/health').status_code == 200 else 1)\"")

        logger.info("Production deployment completed successfully!")

    def create_production_env_template(self):
        """Create a production environment template"""
        template = """# Production Environment Configuration
FLASK_ENV=production
JWT_SECRET_KEY=your-super-secret-jwt-key-change-this-in-production
GOOGLE_API_KEY=your-google-api-key
DATABASE_URL=postgresql://user:password@localhost:5432/secureops_prod
REDIS_URL=redis://localhost:6379/0

# Security
SECRET_KEY=your-secret-key-change-this
CORS_ORIGINS=https://yourdomain.com

# Logging
LOG_LEVEL=INFO
LOG_FILE=/app/logs/secureops.log

# Email (for notifications)
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password
"""

        with open(self.project_root / ".env.production", "w") as f:
            f.write(template)

        logger.info("Created .env.production template. Please configure it with your production values.")

    def run_security_audit(self):
        """Run security audit on dependencies"""
        logger.info("Running security audit...")

        # Backend security check
        logger.info("Checking backend dependencies...")
        self.run_command("pip audit", cwd=self.backend_dir, check=False)

        # Frontend security check
        logger.info("Checking frontend dependencies...")
        self.run_command("npm audit", cwd=self.frontend_dir, check=False)

        logger.info("Security audit completed.")

    def generate_deployment_docs(self):
        """Generate deployment documentation"""
        logger.info("Generating deployment documentation...")

        docs_content = """# Secure-Ops.AI Production Deployment Guide

## Prerequisites

- Docker and Docker Compose
- Python 3.8+
- Node.js 16+
- At least 4GB RAM
- 10GB free disk space

## Quick Start

1. Clone the repository
2. Run the production build script:
   ```bash
   python build_production.py
   ```

3. Configure your production environment:
   ```bash
   cp .env.production.example .env.production
   # Edit .env.production with your values
   ```

4. Deploy:
   ```bash
   python build_production.py --deploy
   ```

## Environment Variables

See `.env.production` for all required environment variables.

## Monitoring

- Health checks: `GET /health`
- Metrics endpoint: `GET /metrics`
- Logs: Available in `/app/logs/` directory

## Security

- JWT tokens with configurable expiration
- CORS protection
- Input validation and sanitization
- Rate limiting (configurable)

## Backup

Regular backups of:
- PostgreSQL database
- Log files
- Configuration files

## Troubleshooting

### Common Issues

1. **Port conflicts**: Ensure ports 80, 443, 8000 are available
2. **Memory issues**: Increase Docker memory limit to 4GB+
3. **Database connection**: Check DATABASE_URL configuration

### Logs

Check logs with:
```bash
docker-compose logs backend
docker-compose logs frontend
docker-compose logs nginx
```
"""

        with open(self.project_root / "DEPLOYMENT.md", "w") as f:
            f.write(docs_content)

        logger.info("Deployment documentation generated: DEPLOYMENT.md")

def main():
    """Main production build function"""
    builder = ProductionBuilder()

    if len(sys.argv) > 1:
        if sys.argv[1] == "--deploy":
            builder.check_prerequisites()
            builder.setup_backend_production()
            builder.setup_frontend_production()
            builder.build_docker_images()
            builder.run_production_tests()
            builder.deploy_production()
        elif sys.argv[1] == "--test":
            builder.run_production_tests()
        elif sys.argv[1] == "--security":
            builder.run_security_audit()
        elif sys.argv[1] == "--docs":
            builder.generate_deployment_docs()
    else:
        # Full production build
        logger.info("Starting full production build...")

        builder.check_prerequisites()
        builder.setup_backend_production()
        builder.setup_frontend_production()
        builder.build_docker_images()
        builder.run_production_tests()
        builder.run_security_audit()
        builder.generate_deployment_docs()

        logger.info("Production build completed successfully!")
        logger.info("Run 'python build_production.py --deploy' to deploy to production.")

if __name__ == "__main__":
    main()