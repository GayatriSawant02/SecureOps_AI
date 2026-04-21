import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);

  const validateToken = useCallback(async (authToken) => {
    try {
      const response = await fetch('http://localhost:8000/auth/me', {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else {
        // Token invalid, clear session
        logout();
      }
    } catch (error) {
      // Token validation failed, clear session
      logout();
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Check local storage for existing session
    const storedToken = localStorage.getItem('secureops_token');
    const storedUser = localStorage.getItem('secureops_user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
      // Validate token with backend
      validateToken(storedToken);
    } else {
      setLoading(false);
    }
  }, [validateToken]);

  const login = async (email, password) => {
    const response = await fetch('http://localhost:8000/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Login failed');
    }

    const data = await response.json();
    const { token: authToken, user: userData } = data;

    setToken(authToken);
    setUser(userData);
    localStorage.setItem('secureops_token', authToken);
    localStorage.setItem('secureops_user', JSON.stringify(userData));

    return userData;
  };

  const signup = async (name, email, password) => {
    const response = await fetch('http://localhost:8000/auth/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name, email, password })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Signup failed');
    }

    const data = await response.json();
    const { token: authToken, user: userData } = data;

    setToken(authToken);
    setUser(userData);
    localStorage.setItem('secureops_token', authToken);
    localStorage.setItem('secureops_user', JSON.stringify(userData));

    return userData;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('secureops_token');
    localStorage.removeItem('secureops_user');
  };

  const getAuthHeaders = () => {
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  };

  const value = {
    user,
    token,
    loading,
    login,
    signup,
    logout,
    getAuthHeaders
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired
};

