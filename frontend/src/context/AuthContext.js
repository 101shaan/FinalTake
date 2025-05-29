import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state from localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem('finaltake_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Error parsing saved user:', error);
        localStorage.removeItem('finaltake_user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    try {
      // Mock authentication - in real app, this would call your backend API
      const savedUsers = JSON.parse(localStorage.getItem('finaltake_users') || '{}');
      
      if (savedUsers[username] && savedUsers[username].password === password) {
        const userData = {
          username,
          loginTime: new Date().toISOString(),
          likedMovies: savedUsers[username].likedMovies || [],
          watchLater: savedUsers[username].watchLater || []
        };
        
        setUser(userData);
        localStorage.setItem('finaltake_user', JSON.stringify(userData));
        return { success: true };
      } else {
        return { success: false, error: 'Invalid username or password' };
      }
    } catch (error) {
      return { success: false, error: 'Login failed. Please try again.' };
    }
  };

  const signup = async (username, password) => {
    try {
      // Mock user registration
      const savedUsers = JSON.parse(localStorage.getItem('finaltake_users') || '{}');
      
      if (savedUsers[username]) {
        return { success: false, error: 'Username already exists' };
      }

      // Create new user
      const newUser = {
        password,
        createdAt: new Date().toISOString(),
        likedMovies: [],
        watchLater: []
      };

      savedUsers[username] = newUser;
      localStorage.setItem('finaltake_users', JSON.stringify(savedUsers));

      // Auto-login after signup
      const userData = {
        username,
        loginTime: new Date().toISOString(),
        likedMovies: [],
        watchLater: []
      };

      setUser(userData);
      localStorage.setItem('finaltake_user', JSON.stringify(userData));
      
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Signup failed. Please try again.' };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('finaltake_user');
  };

  const updateUserData = (updates) => {
    if (!user) return;
    
    const updatedUser = { ...user, ...updates };
    setUser(updatedUser);
    localStorage.setItem('finaltake_user', JSON.stringify(updatedUser));
    
    // Also update in users database
    const savedUsers = JSON.parse(localStorage.getItem('finaltake_users') || '{}');
    if (savedUsers[user.username]) {
      savedUsers[user.username] = {
        ...savedUsers[user.username],
        ...updates
      };
      localStorage.setItem('finaltake_users', JSON.stringify(savedUsers));
    }
  };

  const value = {
    user,
    loading,
    login,
    signup,
    logout,
    updateUserData,
    isAuthenticated: !!user
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook for checking if user is authenticated before actions
export const useRequireAuth = () => {
  const { user } = useAuth();
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);

  const requireAuth = (callback) => {
    if (user) {
      callback();
    } else {
      setShowAuthPrompt(true);
    }
  };

  return {
    requireAuth,
    showAuthPrompt,
    setShowAuthPrompt
  };
};