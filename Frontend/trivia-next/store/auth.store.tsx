import { create } from 'zustand';

interface User {
  id: string;
  name: string;
  email: string;
  // Add any additional fields as needed
}

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  setUser: (user: User | null) => void;
  checkUser: () => Promise<void>;
  signIn: (credentials: { email: string; password: string }) => Promise<void>;
  signOut: () => Promise<void>;
  initialize: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,
  error: null,

  // Initialize auth state from localStorage
  initialize: () => {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        set({ user: JSON.parse(storedUser), loading: false });
      } else {
        set({ loading: false });
      }
    } catch (error) {
      console.error('Error initializing auth state:', error);
      set({ loading: false });
    }
  },

  // Immediately update the user and mark loading as false.
  setUser: (user: User | null) => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
    set({ user, loading: false });
  },

  // Client-side check for authenticated user
  checkUser: async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/me`, {
        credentials: 'include',
        headers: {
          'Accept': 'application/json'
        }
      });
      
      if (res.ok) {
        const data = await res.json();
        set({ user: data, loading: false, error: null });
        localStorage.setItem('user', JSON.stringify(data));
      } else {
        set({ user: null, loading: false });
        localStorage.removeItem('user');
      }
    } catch (error: any) {
      console.error('Error checking user:', error);
      set({ error: error.message, loading: false });
    }
  },

  // Sign in action with provided credentials
  signIn: async (credentials: { email: string; password: string }) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/sign-in`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(credentials),
      });
      
      if (res.ok) {
        const data = await res.json();
        set({ user: data.user, error: null });
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('token', data.token);
      } else {
        const errorData = await res.json();
        set({ error: errorData.message });
      }
    } catch (error: any) {
      console.error('Sign in error:', error);
      set({ error: error.message });
    }
  },

  // Sign out action
  signOut: async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/sign-out`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      if (response.ok) {
        // Clear all auth-related data
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        set({ user: null, error: null });
      } else {
        throw new Error('Failed to sign out');
      }
    } catch (error: any) {
      console.error('Sign out error:', error);
      set({ error: error.message });
    }
  },
}));
