import React, { createContext, useState, useContext, useEffect } from 'react';
import { api } from '../lib/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const { user } = await api.getMe();
          setUser(user);
        } catch (error) {
          console.error('Auth init failed:', error);
          localStorage.removeItem('token');
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    try {
      setLoading(true);
      const { user } = await api.login(email, password);
      setUser(user);
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const signup = async (userData) => {
    try {
      // Remove avatar file object - we'll upload it separately
      const { avatar, profilePicture, ...cleanData } = userData;
      
      const { user, token } = await api.signup(cleanData);
      
      // Upload avatar if provided
      if (avatar instanceof File || profilePicture instanceof File) {
        try {
          const file = avatar || profilePicture;
          const uploadResult = await api.uploadAvatar(file);
          user.avatar = uploadResult.avatar;
        } catch (uploadError) {
          console.error('Avatar upload failed:', uploadError);
          // Continue with signup even if avatar upload fails
        }
      }
      
      setUser(user);
      return { success: true };
    } catch (error) {
      console.error('Signup error:', error);
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    api.logout();
    setUser(null);
  };

  const updateProfile = async (updates) => {
    try {
      // Handle avatar upload separately if it's a file
      const { avatar, profilePicture, ...cleanUpdates } = updates;
      
      if (avatar instanceof File || profilePicture instanceof File) {
        const file = avatar || profilePicture;
        const uploadResult = await api.uploadAvatar(file);
        cleanUpdates.avatar = uploadResult.avatar;
      }
      
      const { user: updatedUser } = await api.updateProfile(cleanUpdates);
      setUser(updatedUser);
      return { success: true };
    } catch (error) {
      console.error('Update profile error:', error);
      return { success: false, error: error.message };
    }
  };

  const deleteAccount = async () => {
    try {
      await api.deleteAccount();
      api.logout();
      setUser(null);
      return { success: true };
    } catch (error) {
      console.error('Delete account error:', error);
      return { success: false, error: error.message };
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      signup,
      logout,
      updateProfile,
      deleteAccount
    }}>
      {children}
    </AuthContext.Provider>
  );
};
