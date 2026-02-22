'use client';

import { createContext, useContext, useState, useEffect, useMemo } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loginAttempts, setLoginAttempts] = useState({});
  const [lockoutTime, setLockoutTime] = useState({});
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Initialize test users if they don't exist
        if (!localStorage.getItem('users')) {
          const testUsers = [
            {
              id: 1,
              username: 'admin',
              password: 'admin123',
              role: 'admin',
              name: 'Administrator'
            },
            {
              id: 2,
              username: 'super',
              password: 'super123',
              role: 'superuser',
              name: 'Super User'
            },
            {
              id: 3,
              username: 'user1',
              password: 'user123',
              role: 'user',
              name: 'Regular User 1'
            },
            {
              id: 4,
              username: 'user2',
              password: 'user123',
              role: 'user',
              name: 'Regular User 2'
            }
          ];
          localStorage.setItem('users', JSON.stringify(testUsers));
        }

        // Load user data from localStorage on initial load
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }

        // Load login attempts and lockout data
        const storedAttempts = localStorage.getItem('loginAttempts');
        const storedLockout = localStorage.getItem('lockoutTime');
        if (storedAttempts) setLoginAttempts(JSON.parse(storedAttempts));
        if (storedLockout) setLockoutTime(JSON.parse(storedLockout));
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setIsInitializing(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (username, password) => {
    // Check if user is locked out
    if (isLockedOut(username)) {
      const remainingTime = getRemainingLockoutTime(username);
      throw new Error(`Account is locked. Try again in ${Math.ceil(remainingTime / 60000)} minutes.`);
    }

    // Simulated authentication - replace with actual authentication logic
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const foundUser = users.find(u => u.username === username);

    if (foundUser && foundUser.password === password) {
      // Successful login
      setUser(foundUser);
      localStorage.setItem('user', JSON.stringify(foundUser));
      resetLoginAttempts(username);
      return foundUser;
    } else {
      // Failed login
      incrementLoginAttempts(username);
      const attempts = getLoginAttempts(username);
      if (attempts >= 5) {
        lockAccount(username);
        throw new Error('Account locked for 10 minutes due to too many failed attempts.');
      }
      throw new Error(`Invalid credentials. ${5 - attempts} attempts remaining.`);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const isLockedOut = (username) => {
    const lockoutEndTime = lockoutTime[username];
    return lockoutEndTime && lockoutEndTime > Date.now();
  };

  const getRemainingLockoutTime = (username) => {
    const lockoutEndTime = lockoutTime[username];
    return lockoutEndTime ? Math.max(0, lockoutEndTime - Date.now()) : 0;
  };

  const incrementLoginAttempts = (username) => {
    const attempts = (loginAttempts[username] || 0) + 1;
    const updatedAttempts = { ...loginAttempts, [username]: attempts };
    setLoginAttempts(updatedAttempts);
    localStorage.setItem('loginAttempts', JSON.stringify(updatedAttempts));
  };

  const resetLoginAttempts = (username) => {
    const updatedAttempts = { ...loginAttempts };
    delete updatedAttempts[username];
    setLoginAttempts(updatedAttempts);
    localStorage.setItem('loginAttempts', JSON.stringify(updatedAttempts));

    const updatedLockout = { ...lockoutTime };
    delete updatedLockout[username];
    setLockoutTime(updatedLockout);
    localStorage.setItem('lockoutTime', JSON.stringify(updatedLockout));
  };

  const lockAccount = (username) => {
    const lockoutEndTime = Date.now() + 10 * 60 * 1000; // 10 minutes
    const updatedLockout = { ...lockoutTime, [username]: lockoutEndTime };
    setLockoutTime(updatedLockout);
    localStorage.setItem('lockoutTime', JSON.stringify(updatedLockout));
  };

  const getLoginAttempts = (username) => {
    return loginAttempts[username] || 0;
  };

  const contextValue = useMemo(() => ({
    user,
    login,
    logout,
    isLockedOut,
    getRemainingLockoutTime,
    getLoginAttempts,
    isInitializing
  }), [user, loginAttempts, lockoutTime, isInitializing]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
