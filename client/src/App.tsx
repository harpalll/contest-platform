import React, { useEffect, useState } from 'react';
import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './routes';
import useAuthStore from './store/authStore';
import api from './services/api';

const App = () => {
  const { token, user, login, logout } = useAuthStore();
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      // If we have a token but no user, try to hydrate the session
      if (token && !user) {
        try {
          const res = await api.get('/auth/me', {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (res.data.success && res.data.data) {
            login(res.data.data, token);
          } else {
            logout();
          }
        } catch (err) {
          console.error('Session recovery failed', err);
          logout();
        }
      }
      setIsInitializing(false);
    };

    checkSession();
  }, [token, user, login, logout]);

  if (isInitializing && token && !user) {
    return <div className="min-h-screen flex items-center justify-center">Loading session...</div>;
  }

  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
};

export default App;
