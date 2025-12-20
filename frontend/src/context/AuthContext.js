import React, { createContext, useState, useContext, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = () => {
      const storedUser = localStorage.getItem('user');
      const token = localStorage.getItem('token');
      
      if (storedUser && token) {
        setUser(JSON.parse(storedUser));
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    const response = await authAPI.login({ email, password });
    const { token, userId, name, email: userEmail, role } = response.data;
    
    const userData = { userId, name, email: userEmail, role };
    
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    
    return userData;
  };

  const register = async (data) => {
    const response = await authAPI.register(data);
    const { token, userId, name, email, role } = response.data;
    
    const userData = { userId, name, email, role };
    
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    
    return userData;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const updateUser = (updatedData) => {
    const newUserData = { ...user, ...updatedData };
    localStorage.setItem('user', JSON.stringify(newUserData));
    setUser(newUserData);
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateUser,
    isAuthenticated: !!user,
    isEmployer: user?.role === 'EMPLOYER',
    isJobSeeker: user?.role === 'JOB_SEEKER',
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
