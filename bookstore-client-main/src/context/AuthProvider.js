import React, { useState, useEffect } from 'react';
import AuthContext from './AuthContext';
import { jwtDecode } from 'jwt-decode';
import axiosInstance from '../api/axiosConfig';

function AuthProvider({ children }) {
  const [authTokens, setAuthTokens] = useState(() => {
    const tokens = localStorage.getItem('tokens');
    return tokens ? JSON.parse(tokens) : null;
  });

  const [user, setUser] = useState(() => {
    return authTokens ? jwtDecode(authTokens.access) : null;
  });

  // Добавляем useEffect для обновления токена
  useEffect(() => {
    const interval = setInterval(() => {
      if (authTokens) {
        updateToken();
      }
    }, 4 * 60 * 1000); // Обновляем токен каждые 4 минуты (до истечения 5 минут)

    return () => clearInterval(interval);
  }, [authTokens]);

  const updateToken = async () => {
    try {
      const response = await axiosInstance.post('/api/token/refresh/', {
        refresh: authTokens.refresh,
      });
      setAuthTokens(response.data);
      setUser(jwtDecode(response.data.access));
      localStorage.setItem('tokens', JSON.stringify(response.data));
    } catch (error) {
      console.error('Ошибка обновления токена', error);
      logout();
    }
  };

  const login = (tokens) => {
    setAuthTokens(tokens);
    setUser(jwtDecode(tokens.access));
    localStorage.setItem('tokens', JSON.stringify(tokens));
  };

  const logout = () => {
    setAuthTokens(null);
    setUser(null);
    localStorage.removeItem('tokens');
  };

  return (
    <AuthContext.Provider value={{ authTokens, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthProvider;