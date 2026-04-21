import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock dependencies
const mockUseAuth = jest.fn();
const mockApiService = {
  sendChatMessage: jest.fn()
};

jest.mock('../context/AuthContext', () => ({
  useAuth: () => mockUseAuth()
}));

jest.mock('../services/api', () => ({
  ApiService: jest.fn().mockImplementation(() => mockApiService)
}));

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
    button: ({ children, ...props }) => <button {...props}>{children}</button>,
  }
}));

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  Send: () => <div data-testid="send-icon">Send</div>,
  Bot: () => <div data-testid="bot-icon">Bot</div>,
  User: () => <div data-testid="user-icon">User</div>,
  Sparkles: () => <div data-testid="sparkles-icon">Sparkles</div>,
  AlertCircle: () => <div data-testid="alert-icon">Alert</div>
}));

// Import after mocks
import Chatbot from '../pages/dashboard/Chatbot';

describe('Chatbot Component', () => {
  beforeEach(() => {
    mockUseAuth.mockReturnValue({
      getAuthHeaders: jest.fn(() => ({ 'Authorization': 'Bearer test-token' }))
    });

    // Reset mocks
    jest.clearAllMocks();
  });

  test('renders chatbot with initial system message', () => {
    render(<Chatbot />);

    expect(screen.getByText('SecureOps AI Assistant')).toBeInTheDocument();
    expect(screen.getByText('System online. I am your SecureOps AI assistant. How can I augment your operations today?')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Type your message...')).toBeInTheDocument();
  });

  test('displays predefined prompts', () => {
    render(<Chatbot />);

    expect(screen.getByText('Scan network for anomalies')).toBeInTheDocument();
    expect(screen.getByText('Analyze recent logs')).toBeInTheDocument();
    expect(screen.getByText('Check system health')).toBeInTheDocument();
  });

  test('sends message when form is submitted', async () => {
    mockApiService.sendChatMessage.mockResolvedValue({
      response: 'AI response message'
    });

    render(<Chatbot />);

    const input = screen.getByPlaceholderText('Type your message...');
    const sendButton = screen.getByTestId('send-icon').closest('button');

    fireEvent.change(input, { target: { value: 'Hello AI' } });
    fireEvent.click(sendButton);

    // Check that user message appears
    expect(screen.getByText('Hello AI')).toBeInTheDocument();

    // Wait for AI response
    await waitFor(() => {
      expect(screen.getByText('AI response message')).toBeInTheDocument();
    });

    expect(mockApiService.sendChatMessage).toHaveBeenCalledWith('Hello AI', expect.any(Object));
  });

  test('handles API errors gracefully', async () => {
    mockApiService.sendChatMessage.mockRejectedValue(new Error('API Error'));

    render(<Chatbot />);

    const input = screen.getByPlaceholderText('Type your message...');
    const sendButton = screen.getByTestId('send-icon').closest('button');

    fireEvent.change(input, { target: { value: 'Test message' } });
    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(screen.getByText(/Error:/)).toBeInTheDocument();
    });
  });

  test('prevents sending empty messages', () => {
    render(<Chatbot />);

    const sendButton = screen.getByTestId('send-icon').closest('button');

    fireEvent.click(sendButton);

    // Should not call API for empty message
    expect(mockApiService.sendChatMessage).not.toHaveBeenCalled();
  });

  test('shows typing indicator while waiting for response', async () => {
    mockApiService.sendChatMessage.mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve({ response: 'Response' }), 100))
    );

    render(<Chatbot />);

    const input = screen.getByPlaceholderText('Type your message...');
    const sendButton = screen.getByTestId('send-icon').closest('button');

    fireEvent.change(input, { target: { value: 'Test' } });
    fireEvent.click(sendButton);

    // Should show typing indicator
    expect(screen.getByText('AI is typing...')).toBeInTheDocument();

    // After response, typing indicator should disappear
    await waitFor(() => {
      expect(screen.queryByText('AI is typing...')).not.toBeInTheDocument();
    });
  });

  test('uses predefined prompt when clicked', async () => {
    mockApiService.sendChatMessage.mockResolvedValue({
      response: 'Analysis complete'
    });

    render(<Chatbot />);

    const promptButton = screen.getByText('Scan network for anomalies');
    fireEvent.click(promptButton);

    await waitFor(() => {
      expect(screen.getByText('Scan network for anomalies')).toBeInTheDocument();
      expect(screen.getByText('Analysis complete')).toBeInTheDocument();
    });

    expect(mockApiService.sendChatMessage).toHaveBeenCalledWith('Scan network for anomalies', expect.any(Object));
  });
});