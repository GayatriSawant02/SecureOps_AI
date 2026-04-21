import pytest
import json
import io
from unittest.mock import Mock, patch, MagicMock
import sys
import os

# Add the parent directory to the path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from Backend.main import app
from Backend.routes import api
from Backend.config import JWT_SECRET_KEY


class TestAPIIntegration:
    """Integration tests for API endpoints"""

    def setup_method(self):
        """Set up test client and fixtures"""
        self.app = app
        self.client = self.app.test_client()
        self.app.config['TESTING'] = True

    @pytest.mark.integration
    def test_health_check(self):
        """Test health check endpoint"""
        response = self.client.get('/health')
        assert response.status_code == 200

        data = json.loads(response.data)
        assert data['status'] == 'ok'
        assert 'message' in data

    @pytest.mark.integration
    def test_root_endpoint(self):
        """Test root endpoint"""
        response = self.client.get('/')
        assert response.status_code == 200

        data = json.loads(response.data)
        assert data['status'] == 'ok'
        assert 'Secure Ops AI backend' in data['message']

    @pytest.mark.integration
    @patch('Backend.routes.authenticate_user')
    @patch('Backend.routes.generate_token')
    def test_login_success(self, mock_generate_token, mock_authenticate):
        """Test successful login"""
        # Mock the authentication
        mock_authenticate.return_value = {'id': 1, 'email': 'test@example.com', 'name': 'Test User'}
        mock_generate_token.return_value = 'mock.jwt.token'

        login_data = {
            'email': 'test@example.com',
            'password': 'password123'
        }

        response = self.client.post('/auth/login',
                                  data=json.dumps(login_data),
                                  content_type='application/json')

        assert response.status_code == 200
        data = json.loads(response.data)
        assert 'token' in data
        assert 'user' in data
        assert data['user']['email'] == 'test@example.com'

    @pytest.mark.integration
    def test_login_missing_credentials(self):
        """Test login with missing credentials"""
        response = self.client.post('/auth/login',
                                  data=json.dumps({}),
                                  content_type='application/json')

        assert response.status_code == 400
        data = json.loads(response.data)
        assert 'error' in data

    @pytest.mark.integration
    @patch('Backend.routes.authenticate_user')
    def test_login_invalid_credentials(self, mock_authenticate):
        """Test login with invalid credentials"""
        mock_authenticate.return_value = None

        login_data = {
            'email': 'test@example.com',
            'password': 'wrongpassword'
        }

        response = self.client.post('/auth/login',
                                  data=json.dumps(login_data),
                                  content_type='application/json')

        assert response.status_code == 401
        data = json.loads(response.data)
        assert 'error' in data
        assert 'Invalid credentials' in data['error']

    @pytest.mark.integration
    @patch('Backend.routes.register_user')
    @patch('Backend.routes.generate_token')
    def test_signup_success(self, mock_generate_token, mock_register):
        """Test successful signup"""
        mock_register.return_value = {'id': 1, 'email': 'new@example.com', 'name': 'New User'}
        mock_generate_token.return_value = 'mock.jwt.token'

        signup_data = {
            'name': 'New User',
            'email': 'new@example.com',
            'password': 'password123'
        }

        response = self.client.post('/auth/signup',
                                  data=json.dumps(signup_data),
                                  content_type='application/json')

        assert response.status_code == 200
        data = json.loads(response.data)
        assert 'token' in data
        assert 'user' in data

    @pytest.mark.integration
    def test_signup_missing_fields(self):
        """Test signup with missing required fields"""
        response = self.client.post('/auth/signup',
                                  data=json.dumps({'email': 'test@example.com'}),
                                  content_type='application/json')

        assert response.status_code == 400
        data = json.loads(response.data)
        assert 'error' in data

    @pytest.mark.integration
    @patch('Backend.routes.analyze_logs')
    def test_analyze_text_success(self, mock_analyze):
        """Test successful text analysis"""
        mock_analyze.return_value = {
            'summary': {'total_entries': 1},
            'threats': [],
            'entries': [{'level': 'INFO', 'message': 'Test'}]
        }

        # First, get a token by mocking login
        with patch('Backend.routes.authenticate_user') as mock_auth, \
             patch('Backend.routes.generate_token') as mock_token:

            mock_auth.return_value = {'id': 1, 'email': 'test@example.com'}
            mock_token.return_value = 'test.jwt.token'

            login_response = self.client.post('/auth/login',
                                            data=json.dumps({'email': 'test@example.com', 'password': 'pass'}),
                                            content_type='application/json')
            token = json.loads(login_response.data)['token']

        # Now test the analyze endpoint
        response = self.client.post('/analyze',
                                  data=json.dumps({'text': 'Test log content'}),
                                  content_type='application/json',
                                  headers={'Authorization': f'Bearer {token}'})

        assert response.status_code == 200
        data = json.loads(response.data)
        assert 'summary' in data
        assert 'threats' in data
        assert 'entries' in data

    @pytest.mark.integration
    def test_analyze_text_unauthorized(self):
        """Test text analysis without authentication"""
        response = self.client.post('/analyze',
                                  data=json.dumps({'text': 'Test log content'}),
                                  content_type='application/json')

        assert response.status_code == 401

    @pytest.mark.integration
    def test_analyze_text_missing_text(self):
        """Test text analysis with missing text field"""
        # Mock authentication
        with patch('Backend.routes.authenticate_user') as mock_auth, \
             patch('Backend.routes.generate_token') as mock_token:

            mock_auth.return_value = {'id': 1, 'email': 'test@example.com'}
            mock_token.return_value = 'test.jwt.token'

            login_response = self.client.post('/auth/login',
                                            data=json.dumps({'email': 'test@example.com', 'password': 'pass'}),
                                            content_type='application/json')
            token = json.loads(login_response.data)['token']

        response = self.client.post('/analyze',
                                  data=json.dumps({}),
                                  content_type='application/json',
                                  headers={'Authorization': f'Bearer {token}'})

        assert response.status_code == 400
        data = json.loads(response.data)
        assert 'error' in data

    @pytest.mark.integration
    @patch('Backend.routes.read_uploaded_log')
    @patch('Backend.routes.analyze_logs')
    def test_upload_file_success(self, mock_analyze, mock_read_file):
        """Test successful file upload and analysis"""
        mock_read_file.return_value = 'Parsed log content'
        mock_analyze.return_value = {
            'summary': {'total_entries': 1},
            'threats': [],
            'entries': [{'level': 'INFO', 'message': 'Test'}]
        }

        # Mock authentication
        with patch('Backend.routes.authenticate_user') as mock_auth, \
             patch('Backend.routes.generate_token') as mock_token:

            mock_auth.return_value = {'id': 1, 'email': 'test@example.com'}
            mock_token.return_value = 'test.jwt.token'

            login_response = self.client.post('/auth/login',
                                            data=json.dumps({'email': 'test@example.com', 'password': 'pass'}),
                                            content_type='application/json')
            token = json.loads(login_response.data)['token']

        # Create a test file
        test_file = io.BytesIO(b'Test log content')
        test_file.filename = 'test.log'

        response = self.client.post('/upload',
                                  data={'file': (test_file, 'test.log')},
                                  content_type='multipart/form-data',
                                  headers={'Authorization': f'Bearer {token}'})

        assert response.status_code == 200
        data = json.loads(response.data)
        assert 'summary' in data

    @pytest.mark.integration
    def test_upload_file_no_file(self):
        """Test file upload without providing a file"""
        # Mock authentication
        with patch('Backend.routes.authenticate_user') as mock_auth, \
             patch('Backend.routes.generate_token') as mock_token:

            mock_auth.return_value = {'id': 1, 'email': 'test@example.com'}
            mock_token.return_value = 'test.jwt.token'

            login_response = self.client.post('/auth/login',
                                            data=json.dumps({'email': 'test@example.com', 'password': 'pass'}),
                                            content_type='application/json')
            token = json.loads(login_response.data)['token']

        response = self.client.post('/upload',
                                  data={},
                                  content_type='multipart/form-data',
                                  headers={'Authorization': f'Bearer {token}'})

        assert response.status_code == 400
        data = json.loads(response.data)
        assert 'error' in data

    @pytest.mark.integration
    @patch('Backend.routes.generate_chat_response')
    def test_chat_success(self, mock_chat_response):
        """Test successful chat interaction"""
        mock_chat_response.return_value = 'This is a test response from AI'

        # Mock authentication
        with patch('Backend.routes.authenticate_user') as mock_auth, \
             patch('Backend.routes.generate_token') as mock_token:

            mock_auth.return_value = {'id': 1, 'email': 'test@example.com'}
            mock_token.return_value = 'test.jwt.token'

            login_response = self.client.post('/auth/login',
                                            data=json.dumps({'email': 'test@example.com', 'password': 'pass'}),
                                            content_type='application/json')
            token = json.loads(login_response.data)['token']

        chat_data = {
            'message': 'Hello AI',
            'context': {'session_id': 'test123'}
        }

        response = self.client.post('/chat',
                                  data=json.dumps(chat_data),
                                  content_type='application/json',
                                  headers={'Authorization': f'Bearer {token}'})

        assert response.status_code == 200
        data = json.loads(response.data)
        assert 'response' in data
        assert data['response'] == 'This is a test response from AI'

    @pytest.mark.integration
    def test_chat_missing_message(self):
        """Test chat without message"""
        # Mock authentication
        with patch('Backend.routes.authenticate_user') as mock_auth, \
             patch('Backend.routes.generate_token') as mock_token:

            mock_auth.return_value = {'id': 1, 'email': 'test@example.com'}
            mock_token.return_value = 'test.jwt.token'

            login_response = self.client.post('/auth/login',
                                            data=json.dumps({'email': 'test@example.com', 'password': 'pass'}),
                                            content_type='application/json')
            token = json.loads(login_response.data)['token']

        response = self.client.post('/chat',
                                  data=json.dumps({}),
                                  content_type='application/json',
                                  headers={'Authorization': f'Bearer {token}'})

        assert response.status_code == 400
        data = json.loads(response.data)
        assert 'error' in data

    @pytest.mark.integration
    def test_auth_me_unauthorized(self):
        """Test getting user info without authentication"""
        response = self.client.get('/auth/me')
        assert response.status_code == 401

    @pytest.mark.integration
    @patch('Backend.routes.get_current_user')
    def test_auth_me_success(self, mock_get_user):
        """Test getting authenticated user info"""
        mock_get_user.return_value = {'id': 1, 'email': 'test@example.com', 'name': 'Test User'}

        # Mock authentication
        with patch('Backend.routes.authenticate_user') as mock_auth, \
             patch('Backend.routes.generate_token') as mock_token:

            mock_auth.return_value = {'id': 1, 'email': 'test@example.com'}
            mock_token.return_value = 'test.jwt.token'

            login_response = self.client.post('/auth/login',
                                            data=json.dumps({'email': 'test@example.com', 'password': 'pass'}),
                                            content_type='application/json')
            token = json.loads(login_response.data)['token']

        response = self.client.get('/auth/me',
                                 headers={'Authorization': f'Bearer {token}'})

        assert response.status_code == 200
        data = json.loads(response.data)
        assert 'user' in data
        assert data['user']['email'] == 'test@example.com'