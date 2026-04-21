import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';

// Mock the auth context
const mockUseAuth = jest.fn();
jest.mock('../context/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
  AuthProvider: ({ children }) => <div>{children}</div>
}));

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
    button: ({ children, ...props }) => <button {...props}>{children}</button>,
  }
}));

// Import components after mocks
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import ProtectedRoute from '../components/ProtectedRoute';

describe('Navbar Component', () => {
  beforeEach(() => {
    mockUseAuth.mockReturnValue({
      user: { name: 'Test User', email: 'test@example.com' },
      logout: jest.fn(),
      loading: false
    });
  });

  test('renders navbar with user info when authenticated', () => {
    render(
      <BrowserRouter>
        <Navbar />
      </BrowserRouter>
    );

    expect(screen.getByText('SecureOps AI')).toBeInTheDocument();
    expect(screen.getByText('Test User')).toBeInTheDocument();
  });

  test('renders login/signup links when not authenticated', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      logout: jest.fn(),
      loading: false
    });

    render(
      <BrowserRouter>
        <Navbar />
      </BrowserRouter>
    );

    expect(screen.getByText('Login')).toBeInTheDocument();
    expect(screen.getByText('Sign Up')).toBeInTheDocument();
  });

  test('calls logout when logout button is clicked', () => {
    const mockLogout = jest.fn();
    mockUseAuth.mockReturnValue({
      user: { name: 'Test User', email: 'test@example.com' },
      logout: mockLogout,
      loading: false
    });

    render(
      <BrowserRouter>
        <Navbar />
      </BrowserRouter>
    );

    const logoutButton = screen.getByText('Logout');
    fireEvent.click(logoutButton);

    expect(mockLogout).toHaveBeenCalled();
  });
});

describe('Sidebar Component', () => {
  beforeEach(() => {
    mockUseAuth.mockReturnValue({
      user: { name: 'Test User', email: 'test@example.com' },
      logout: jest.fn(),
      loading: false
    });
  });

  test('renders sidebar with navigation links', () => {
    render(
      <BrowserRouter>
        <Sidebar />
      </BrowserRouter>
    );

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Logs')).toBeInTheDocument();
    expect(screen.getByText('AI Insights')).toBeInTheDocument();
    expect(screen.getByText('Threat Detection')).toBeInTheDocument();
    expect(screen.getByText('Chatbot')).toBeInTheDocument();
    expect(screen.getByText('Reports')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  test('highlights active link based on current route', () => {
    // Mock window.location.pathname
    delete window.location;
    window.location = { pathname: '/dashboard/logs' };

    render(
      <BrowserRouter>
        <Sidebar />
      </BrowserRouter>
    );

    const logsLink = screen.getByText('Logs');
    expect(logsLink).toHaveClass('bg-blue-100');
  });
});

describe('ProtectedRoute Component', () => {
  test('renders children when user is authenticated', () => {
    mockUseAuth.mockReturnValue({
      user: { name: 'Test User', email: 'test@example.com' },
      loading: false
    });

    render(
      <BrowserRouter>
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      </BrowserRouter>
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  test('redirects to login when user is not authenticated', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      loading: false
    });

    render(
      <BrowserRouter>
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      </BrowserRouter>
    );

    // Should redirect to login, so protected content should not be visible
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  test('shows loading state when authentication is loading', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      loading: true
    });

    render(
      <BrowserRouter>
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      </BrowserRouter>
    );

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });
});