import pytest
from unittest.mock import Mock, patch, MagicMock
import sys
import os

# Add the parent directory to the path so we can import modules
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from ai_analysis.analyzer import analyze_logs
from ai_analysis.log_parser import parse_log_entry
from ai_analysis.threat_detector import detect_threats
from ai_analysis.summarizer import generate_summary
from ai_analysis.rules import apply_rules


class TestLogParser:
    """Test cases for log parsing functionality"""

    def test_parse_log_entry_valid(self):
        """Test parsing a valid log entry"""
        log_line = '2023-12-01 10:30:45 [INFO] User login successful: user@example.com'
        result = parse_log_entry(log_line)

        assert result is not None
        assert result['timestamp'] == '2023-12-01 10:30:45'
        assert result['level'] == 'INFO'
        assert 'user@example.com' in result['message']

    def test_parse_log_entry_malformed(self):
        """Test parsing a malformed log entry"""
        log_line = 'This is not a valid log entry'
        result = parse_log_entry(log_line)

        assert result is None

    def test_parse_log_entry_with_ip(self):
        """Test parsing log entry with IP address"""
        log_line = '2023-12-01 10:30:45 [WARNING] Failed login from 192.168.1.100'
        result = parse_log_entry(log_line)

        assert result is not None
        assert result['level'] == 'WARNING'
        assert '192.168.1.100' in result['message']


class TestThreatDetector:
    """Test cases for threat detection functionality"""

    def test_detect_threats_brute_force(self):
        """Test detection of brute force attacks"""
        log_entries = [
            {'timestamp': '2023-12-01 10:00:00', 'level': 'WARNING', 'message': 'Failed login from 192.168.1.100'},
            {'timestamp': '2023-12-01 10:00:05', 'level': 'WARNING', 'message': 'Failed login from 192.168.1.100'},
            {'timestamp': '2023-12-01 10:00:10', 'level': 'WARNING', 'message': 'Failed login from 192.168.1.100'},
            {'timestamp': '2023-12-01 10:00:15', 'level': 'WARNING', 'message': 'Failed login from 192.168.1.100'},
            {'timestamp': '2023-12-01 10:00:20', 'level': 'WARNING', 'message': 'Failed login from 192.168.1.100'},
        ]

        threats = detect_threats(log_entries)
        assert len(threats) > 0
        assert any('brute force' in threat['type'].lower() for threat in threats)

    def test_detect_threats_suspicious_ip(self):
        """Test detection of suspicious IP addresses"""
        log_entries = [
            {'timestamp': '2023-12-01 10:00:00', 'level': 'INFO', 'message': 'Connection from 10.0.0.1'},
            {'timestamp': '2023-12-01 10:00:05', 'level': 'INFO', 'message': 'Connection from 192.168.1.1'},
        ]

        threats = detect_threats(log_entries)
        # Should not flag private IPs as threats
        assert len(threats) == 0

    def test_detect_threats_empty_logs(self):
        """Test threat detection with empty log entries"""
        threats = detect_threats([])
        assert threats == []


class TestSummarizer:
    """Test cases for log summarization functionality"""

    def test_generate_summary_basic(self):
        """Test basic summary generation"""
        log_entries = [
            {'timestamp': '2023-12-01 10:00:00', 'level': 'INFO', 'message': 'System started'},
            {'timestamp': '2023-12-01 10:05:00', 'level': 'WARNING', 'message': 'High CPU usage'},
            {'timestamp': '2023-12-01 10:10:00', 'level': 'ERROR', 'message': 'Database connection failed'},
        ]

        summary = generate_summary(log_entries)
        assert summary is not None
        assert 'total_entries' in summary
        assert summary['total_entries'] == 3

    def test_generate_summary_empty(self):
        """Test summary generation with empty logs"""
        summary = generate_summary([])
        assert summary is not None
        assert summary['total_entries'] == 0


class TestRules:
    """Test cases for rules application functionality"""

    def test_apply_rules_basic(self):
        """Test basic rules application"""
        log_entry = {'timestamp': '2023-12-01 10:00:00', 'level': 'ERROR', 'message': 'Database connection failed'}

        rules_result = apply_rules(log_entry)
        assert rules_result is not None
        assert 'severity' in rules_result

    def test_apply_rules_critical_error(self):
        """Test rules for critical errors"""
        log_entry = {'timestamp': '2023-12-01 10:00:00', 'level': 'CRITICAL', 'message': 'System crash detected'}

        rules_result = apply_rules(log_entry)
        assert rules_result is not None
        assert rules_result['severity'] == 'critical'


class TestAnalyzer:
    """Test cases for the main analyzer functionality"""

    @patch('ai_analysis.analyzer.parse_log_entry')
    @patch('ai_analysis.analyzer.detect_threats')
    @patch('ai_analysis.analyzer.generate_summary')
    def test_analyze_logs_success(self, mock_summary, mock_threats, mock_parse):
        """Test successful log analysis"""
        # Mock the dependencies
        mock_parse.return_value = [
            {'timestamp': '2023-12-01 10:00:00', 'level': 'INFO', 'message': 'Test log'}
        ]
        mock_threats.return_value = [{'type': 'test_threat', 'severity': 'medium'}]
        mock_summary.return_value = {'total_entries': 1, 'error_count': 0}

        result = analyze_logs('Test log content')

        assert result is not None
        assert 'threats' in result
        assert 'summary' in result
        assert 'entries' in result

    def test_analyze_logs_empty_content(self):
        """Test analysis of empty log content"""
        result = analyze_logs('')

        assert result is not None
        assert result['entries'] == []
        assert result['threats'] == []
        assert result['summary']['total_entries'] == 0

    @patch('ai_analysis.analyzer.parse_log_entry')
    def test_analyze_logs_parse_failure(self, mock_parse):
        """Test analysis when log parsing fails"""
        mock_parse.return_value = []

        result = analyze_logs('Invalid log content')

        assert result is not None
        assert result['entries'] == []
        assert result['summary']['total_entries'] == 0