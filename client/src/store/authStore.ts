import { create } from 'zustand';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'creator' | 'contestee';
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
}

const useAuthStore = create<AuthState>((set) => {
  // Try to recover state from storage safely
  const storedToken = localStorage.getItem('token');
  const storedUser = localStorage.getItem('user');

  let parsedUser = null;
  try {
    if (storedUser && storedUser !== 'undefined') {
      parsedUser = JSON.parse(storedUser);
    }
  } catch (err) {
    console.error('Failed to parse user from local storage:', err);
  }

  return {
    user: parsedUser,
    token: storedToken,
    isAuthenticated: !!storedToken && !!parsedUser,
    login: (user, token) => {
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      set({ user, token, isAuthenticated: true });
    },
    logout: () => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      set({ user: null, token: null, isAuthenticated: false });
    },
  };
});

export default useAuthStore;
