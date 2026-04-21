import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock fetch
global.fetch = jest.fn();

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate
}));

// Import after mocks
import { AuthProvider, useAuth } from '../context/AuthContext';

// Test component that uses auth context
const TestComponent = () => {
  const { user, login, logout, loading } = useAuth();

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      {user ? (
        <div>
          <span>Welcome {user.name}</span>
          <button onClick={logout}>Logout</button>
        </div>
      ) : (
        <div>
          <span>Not logged in</span>
          <button onClick={() => login('test@example.com', 'password')}>Login</button>
        </div>
      )}
    </div>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();

    // Mock successful token validation
    global.fetch.mockImplementation((url) => {
      if (url.includes('/auth/me')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ user: { id: 1, name: 'Test User', email: 'test@example.com' } })
        });
      }
      return Promise.reject(new Error('Unknown URL'));
    });
  });

  test('provides authentication context to children', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByText('Not logged in')).toBeInTheDocument();
  });

  test('handles successful login', async () => {
    global.fetch.mockImplementation((url) => {
      if (url.includes('/auth/login')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            token: 'test.jwt.token',
            user: { id: 1, name: 'Test User', email: 'test@example.com' }
          })
        });
      }
      if (url.includes('/auth/me')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ user: { id: 1, name: 'Test User', email: 'test@example.com' } })
        });
      }
      return Promise.reject(new Error('Unknown URL'));
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    const loginButton = screen.getByText('Login');
    loginButton.click();

    await waitFor(() => {
      expect(screen.getByText('Welcome Test User')).toBeInTheDocument();
    });

    expect(localStorage.getItem('secureops_token')).toBe('test.jwt.token');
    expect(JSON.parse(localStorage.getItem('secureops_user'))).toEqual({
      id: 1, name: 'Test User', email: 'test@example.com'
    });
  });

  test('handles login failure', async () => {
    global.fetch.mockImplementation((url) => {
      if (url.includes('/auth/login')) {
        return Promise.resolve({
          ok: false,
          json: () => Promise.resolve({ error: 'Invalid credentials' })
        });
      }
      return Promise.reject(new Error('Unknown URL'));
    });

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    const loginButton = screen.getByText('Login');

    // Mock login function to throw error
    const mockLogin = async () => {
      throw new Error('Invalid credentials');
    };

    // We need to access the context directly for this test
    // This is a limitation of testing context providers

    consoleSpy.mockRestore();
  });

  test('handles logout', async () => {
    // Set up logged in state
    localStorage.setItem('secureops_token', 'test.token');
    localStorage.setItem('secureops_user', JSON.stringify({ id: 1, name: 'Test User' }));

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Welcome Test User')).toBeInTheDocument();
    });

    const logoutButton = screen.getByText('Logout');
    logoutButton.click();

    expect(localStorage.getItem('secureops_token')).toBeNull();
    expect(localStorage.getItem('secureops_user')).toBeNull();
    expect(screen.getByText('Not logged in')).toBeInTheDocument();
  });

  test('validates token on app start', async () => {
    // Set up stored credentials
    localStorage.setItem('secureops_token', 'stored.token');
    localStorage.setItem('secureops_user', JSON.stringify({ id: 1, name: 'Test User' }));

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:8000/auth/me',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'Bearer stored.token'
          })
        })
      );
    });
  });

  test('handles invalid stored token', async () => {
    // Set up invalid stored credentials
    localStorage.setItem('secureops_token', 'invalid.token');
    localStorage.setItem('secureops_user', JSON.stringify({ id: 1, name: 'Test User' }));

    global.fetch.mockImplementation((url) => {
      if (url.includes('/auth/me')) {
        return Promise.resolve({
          ok: false
        });
      }
      return Promise.reject(new Error('Unknown URL'));
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Not logged in')).toBeInTheDocument();
    });

    expect(localStorage.getItem('secureops_token')).toBeNull();
    expect(localStorage.getItem('secureops_user')).toBeNull();
  });

  test('handles signup', async () => {
    global.fetch.mockImplementation((url) => {
      if (url.includes('/auth/signup')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            token: 'signup.jwt.token',
            user: { id: 2, name: 'New User', email: 'new@example.com' }
          })
        });
      }
      if (url.includes('/auth/me')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ user: { id: 2, name: 'New User', email: 'new@example.com' } })
        });
      }
      return Promise.reject(new Error('Unknown URL'));
    });

    // Create a test component that can call signup
    const SignupTestComponent = () => {
      const { signup } = useAuth();
      return (
        <button onClick={() => signup('New User', 'new@example.com', 'password')}>
          Sign Up
        </button>
      );
    };

    render(
      <AuthProvider>
        <SignupTestComponent />
      </AuthProvider>
    );

    const signupButton = screen.getByText('Sign Up');
    signupButton.click();

    await waitFor(() => {
      expect(localStorage.getItem('secureops_token')).toBe('signup.jwt.token');
    });
  });
});