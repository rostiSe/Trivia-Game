import { create } from 'zustand';

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  setUser: (user: User | null) => void;
  signIn: (credentials: { email: string; password: string }) => Promise<boolean>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,
  error: null,

  // Initialize Zustand store from localStorage immediately
 

  setUser: (user: User | null) => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    }
    set({ user, loading: false });
  },

  signIn: async ({ email, password }) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/sign-in`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      if (res.ok) {
        const data = await res.json();
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        set({ user: data.user, error: null, loading: false });
        return true;
      } else {
        const errorData = await res.json();
        set({ error: errorData.message, loading: false });
        return false;
      }
    } catch (error: any) {
      set({ error: error.message, loading: false });
      return false;
    }
  },

  signOut: async () => {
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/sign-out`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        Accept: 'application/json',
      },
    });
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({ user: null, loading: false });
  },
}));
