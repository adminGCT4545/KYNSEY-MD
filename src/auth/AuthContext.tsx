import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

interface User {
  id: string;
  username: string;
  name: string;
  email: string;
  roles: string[];
  permissions: string[];
}

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  requiresMFA: boolean;
  mfaToken: string | null;
}

interface AuthContextType extends AuthState {
  login: (username: string, password: string, remember?: boolean) => Promise<void>;
  logout: () => void;
  verifyMFA: (code: string) => Promise<void>;
  clearError: () => void;
  refreshToken: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    token: null,
    isLoading: true,
    error: null,
    requiresMFA: false,
    mfaToken: null
  });

  // Check if token exists on initial load
  useEffect(() => {
    const loadUser = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setAuthState(state => ({ ...state, isLoading: false }));
          return;
        }

        // Verify token is valid
        const decodedToken: any = jwtDecode(token);
        const currentTime = Date.now() / 1000;
        
        if (decodedToken.exp < currentTime) {
          // Token expired
          localStorage.removeItem('token');
          setAuthState(state => ({ 
            ...state, 
            isAuthenticated: false, 
            user: null, 
            token: null, 
            isLoading: false 
          }));
          return;
        }

        // Set auth state with token info
        setAuthState(state => ({
          ...state,
          isAuthenticated: true,
          user: {
            id: decodedToken.sub,
            username: decodedToken.username,
            name: decodedToken.name,
            email: decodedToken.email,
            roles: decodedToken.roles || [],
            permissions: decodedToken.permissions || []
          },
          token,
          isLoading: false
        }));

        // Set authorization header for all requests
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      } catch (err) {
        console.error('Error loading user from token', err);
        localStorage.removeItem('token');
        setAuthState(state => ({ 
          ...state, 
          isAuthenticated: false, 
          user: null, 
          token: null, 
          isLoading: false 
        }));
      }
    };

    loadUser();
  }, []);

  // Set up token refresh interval
  useEffect(() => {
    if (!authState.isAuthenticated) return;

    const refreshInterval = setInterval(async () => {
      // Refresh token 5 minutes before expiration
      try {
        await refreshToken();
      } catch (err) {
        console.error('Token refresh failed', err);
      }
    }, 10 * 60 * 1000); // Refresh every 10 minutes

    return () => clearInterval(refreshInterval);
  }, [authState.isAuthenticated]);

  // Handle login
  const login = async (username: string, password: string, remember: boolean = false) => {
    setAuthState(state => ({ ...state, isLoading: true, error: null }));
    
    try {
      const response = await axios.post('/api/auth/login', { username, password });
      
      if (response.data.requiresMFA) {
        // MFA is required
        setAuthState(state => ({
          ...state,
          isLoading: false,
          requiresMFA: true,
          mfaToken: response.data.mfaToken
        }));
        return;
      }
      
      const { token, user } = response.data;
      
      if (remember) {
        localStorage.setItem('token', token);
      } else {
        sessionStorage.setItem('token', token);
      }
      
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      setAuthState({
        isAuthenticated: true,
        user,
        token,
        isLoading: false,
        error: null,
        requiresMFA: false,
        mfaToken: null
      });
    } catch (err: any) {
      setAuthState(state => ({
        ...state,
        isLoading: false,
        error: err.response?.data?.message || 'Login failed. Please check your credentials.'
      }));
    }
  };

  // Handle MFA verification
  const verifyMFA = async (code: string) => {
    if (!authState.mfaToken) {
      setAuthState(state => ({
        ...state,
        error: 'MFA session expired. Please login again.'
      }));
      return;
    }
    
    setAuthState(state => ({ ...state, isLoading: true, error: null }));
    
    try {
      const response = await axios.post('/api/auth/verify-mfa', {
        mfaToken: authState.mfaToken,
        code
      });
      
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      setAuthState({
        isAuthenticated: true,
        user,
        token,
        isLoading: false,
        error: null,
        requiresMFA: false,
        mfaToken: null
      });
    } catch (err: any) {
      setAuthState(state => ({
        ...state,
        isLoading: false,
        error: err.response?.data?.message || 'Invalid verification code. Please try again.'
      }));
    }
  };

  // Handle logout
  const logout = () => {
    axios.post('/api/auth/logout').catch(err => console.error('Logout error', err));
    
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    
    setAuthState({
      isAuthenticated: false,
      user: null,
      token: null,
      isLoading: false,
      error: null,
      requiresMFA: false,
      mfaToken: null
    });
    
    // Redirect to login page will be handled by the component using this context
  };

  // Refresh token
  const refreshToken = async (): Promise<boolean> => {
    if (!authState.token) return false;
    
    try {
      const response = await axios.post('/api/auth/refresh-token');
      const { token } = response.data;
      
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Update user data if needed
      const decodedToken: any = jwtDecode(token);
      
      setAuthState(state => ({
        ...state,
        token,
        user: {
          ...state.user!,
          roles: decodedToken.roles || [],
          permissions: decodedToken.permissions || []
        }
      }));
      
      return true;
    } catch (err) {
      console.error('Error refreshing token', err);
      return false;
    }
  };

  // Clear error
  const clearError = () => {
    setAuthState(state => ({ ...state, error: null }));
  };

  const value = {
    ...authState,
    login,
    logout,
    verifyMFA,
    clearError,
    refreshToken
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;