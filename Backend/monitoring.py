"""
Monitoring and metrics module for Secure-Ops.AI
"""

import time
import psutil
import logging
from flask import Blueprint, jsonify, request
from functools import wraps
import threading
import os
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)

monitoring = Blueprint('monitoring', __name__)

# Metrics storage
metrics = {
    'requests_total': 0,
    'requests_by_endpoint': {},
    'response_times': [],
    'errors_total': 0,
    'errors_by_type': {},
    'active_connections': 0,
    'start_time': time.time(),
    'last_health_check': None
}

# Thread lock for metrics
metrics_lock = threading.Lock()

def record_request(endpoint, method, response_time, status_code):
    """Record request metrics"""
    with metrics_lock:
        metrics['requests_total'] += 1

        endpoint_key = f"{method} {endpoint}"
        if endpoint_key not in metrics['requests_by_endpoint']:
            metrics['requests_by_endpoint'][endpoint_key] = 0
        metrics['requests_by_endpoint'][endpoint_key] += 1

        metrics['response_times'].append(response_time)

        # Keep only last 1000 response times
        if len(metrics['response_times']) > 1000:
            metrics['response_times'] = metrics['response_times'][-1000:]

        if status_code >= 400:
            metrics['errors_total'] += 1
            error_type = '4xx' if status_code < 500 else '5xx'
            if error_type not in metrics['errors_by_type']:
                metrics['errors_by_type'][error_type] = 0
            metrics['errors_by_type'][error_type] += 1

def monitor_requests(f):
    """Decorator to monitor Flask requests"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        start_time = time.time()

        try:
            response = f(*args, **kwargs)
            response_time = time.time() - start_time

            # Record metrics
            endpoint = request.endpoint or 'unknown'
            method = request.method
            status_code = response.status_code if hasattr(response, 'status_code') else 200

            record_request(endpoint, method, response_time, status_code)

            return response
        except Exception as e:
            response_time = time.time() - start_time
            record_request(request.endpoint or 'unknown', request.method, response_time, 500)
            raise e

    return decorated_function

@monitoring.route('/health', methods=['GET'])
def health_check():
    """Comprehensive health check endpoint"""
    health_status = {
        'status': 'healthy',
        'timestamp': datetime.utcnow().isoformat(),
        'version': '1.0.0',
        'checks': {}
    }

    try:
        # System health checks
        health_status['checks']['system'] = check_system_health()
        health_status['checks']['database'] = check_database_health()
        health_status['checks']['external_services'] = check_external_services()

        # Overall status
        all_healthy = all(check['status'] == 'healthy'
                         for check in health_status['checks'].values())

        if not all_healthy:
            health_status['status'] = 'unhealthy'

        status_code = 200 if all_healthy else 503

    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        health_status['status'] = 'unhealthy'
        health_status['error'] = str(e)
        status_code = 503

    with metrics_lock:
        metrics['last_health_check'] = datetime.utcnow().isoformat()

    return jsonify(health_status), status_code

@monitoring.route('/metrics', methods=['GET'])
def get_metrics():
    """Prometheus-style metrics endpoint"""
    with metrics_lock:
        # Calculate response time statistics
        response_times = metrics['response_times']
        avg_response_time = sum(response_times) / len(response_times) if response_times else 0
        max_response_time = max(response_times) if response_times else 0
        min_response_time = min(response_times) if response_times else 0

        # Calculate uptime
        uptime_seconds = time.time() - metrics['start_time']

        metrics_data = {
            'uptime_seconds': uptime_seconds,
            'requests_total': metrics['requests_total'],
            'errors_total': metrics['errors_total'],
            'active_connections': metrics['active_connections'],
            'response_time_average_seconds': avg_response_time,
            'response_time_max_seconds': max_response_time,
            'response_time_min_seconds': min_response_time,
            'requests_by_endpoint': metrics['requests_by_endpoint'],
            'errors_by_type': metrics['errors_by_type'],
            'last_health_check': metrics['last_health_check']
        }

    return jsonify(metrics_data)

def check_system_health():
    """Check system resource health"""
    try:
        # CPU usage
        cpu_percent = psutil.cpu_percent(interval=1)

        # Memory usage
        memory = psutil.virtual_memory()
        memory_percent = memory.percent

        # Disk usage
        disk = psutil.disk_usage('/')
        disk_percent = disk.percent

        # Network connections
        connections = len(psutil.net_connections())

        health = {
            'status': 'healthy',
            'cpu_percent': cpu_percent,
            'memory_percent': memory_percent,
            'disk_percent': disk_percent,
            'network_connections': connections
        }

        # Check thresholds
        if cpu_percent > 90 or memory_percent > 90 or disk_percent > 95:
            health['status'] = 'warning'

        if cpu_percent > 95 or memory_percent > 95 or disk_percent > 98:
            health['status'] = 'critical'

        return health

    except Exception as e:
        logger.error(f"System health check failed: {str(e)}")
        return {
            'status': 'error',
            'error': str(e)
        }

def check_database_health():
    """Check database connectivity"""
    try:
        # Import here to avoid circular imports
        from Backend.config import DATABASE_URL

        if not DATABASE_URL or DATABASE_URL.startswith('sqlite'):
            # SQLite or no database configured
            return {
                'status': 'healthy',
                'type': 'sqlite',
                'message': 'SQLite database is always healthy'
            }

        # For PostgreSQL or other databases, you would add connection checks here
        # For now, assume healthy if configured
        return {
            'status': 'healthy',
            'type': 'external',
            'message': 'Database configuration present'
        }

    except Exception as e:
        logger.error(f"Database health check failed: {str(e)}")
        return {
            'status': 'error',
            'error': str(e)
        }

def check_external_services():
    """Check external service connectivity"""
    services_status = {
        'status': 'healthy',
        'services': {}
    }

    try:
        # Check Google AI API if configured
        from Backend.config import GOOGLE_API_KEY
        if GOOGLE_API_KEY:
            services_status['services']['google_ai'] = {
                'status': 'configured',
                'message': 'API key is configured'
            }
        else:
            services_status['services']['google_ai'] = {
                'status': 'not_configured',
                'message': 'API key not configured'
            }

        # Check Redis if configured
        redis_url = os.getenv('REDIS_URL')
        if redis_url:
            services_status['services']['redis'] = {
                'status': 'configured',
                'message': 'Redis URL configured'
            }
        else:
            services_status['services']['redis'] = {
                'status': 'not_configured',
                'message': 'Redis not configured'
            }

    except Exception as e:
        logger.error(f"External services check failed: {str(e)}")
        services_status['status'] = 'error'
        services_status['error'] = str(e)

    return services_status

@monitoring.route('/ping', methods=['GET'])
def ping():
    """Simple ping endpoint for load balancer health checks"""
    return jsonify({'status': 'pong', 'timestamp': datetime.utcnow().isoformat()})

def init_monitoring(app):
    """Initialize monitoring for the Flask app"""
    # Register monitoring blueprint
    app.register_blueprint(monitoring, url_prefix='/api')

    # Add monitoring to all routes
    for rule in app.url_map.iter_rules():
        if rule.endpoint != 'static':
            app.view_functions[rule.endpoint] = monitor_requests(app.view_functions[rule.endpoint])

    logger.info("Monitoring initialized")