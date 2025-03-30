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
  initialize: () => void;
  checkUser: () => Promise<boolean>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  loading: true,
  error: null,

  // Safe initialize function that checks for window
  initialize: () => {
    if (typeof window === 'undefined') {
      set({ loading: false });
      return;
    }
    
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        set({ user: userData, loading: false });
      } else {
        set({ loading: false });
      }
    } catch (error) {
      console.error('Error initializing auth state:', error);
      set({ loading: false });
    }
  },

  // Safe localStorage functions in setUser
  setUser: (user: User | null) => {
    if (typeof window === 'undefined') {
      set({ user, loading: false });
      return;
    }

    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    }
    set({ user, loading: false });
  },

  // Safe localStorage in checkUser
  checkUser: async () => {
    if (typeof window === 'undefined') {
      set({ loading: false });
      return false;
    }

    try {
      set({ loading: true });
      
      const token = localStorage.getItem('token');
      // If no token, user is not authenticated
      if (!token) {
        set({ user: null, loading: false });
        return false;
      }
      
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/me`, {
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      if (res.ok) {
        const userData = await res.json();
        set({ user: userData, loading: false, error: null });
        localStorage.setItem('user', JSON.stringify(userData));
        return true;
      } else {
        // Clear invalid auth state
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        set({ user: null, loading: false });
        return false;
      }
    } catch (error) {
      console.error('Error checking user:', error);
      set({ error: 'Failed to verify authentication', loading: false });
      return false;
    }
  },

  // Similar localStorage safety checks for signIn
  signIn: async ({ email, password }) => {
    try {
      set({ loading: true, error: null });
      
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/sign-in`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      
      if (res.ok && data.token) {
        if (typeof window !== 'undefined') {
          localStorage.setItem('token', data.token);
          
          if (data.user) {
            localStorage.setItem('user', JSON.stringify(data.user));
          }
        }
        
        set({ user: data.user, error: null, loading: false });
        
        if (!data.user) {
          // If user data is missing, try to fetch it
          await get().checkUser();
        }
        
        return true;
      } else {
        set({ 
          error: data.error || 'Failed to sign in', 
          loading: false 
        });
        return false;
      }
    } catch (error: any) {
      console.error('Sign in error:', error);
      set({ 
        error: error.message || 'An unexpected error occurred', 
        loading: false 
      });
      return false;
    }
  },

  // Safe localStorage in signOut
  signOut: async () => {
    try {
      set({ loading: true });
      
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/sign-out`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
      
      set({ user: null, loading: false, error: null });
    } catch (error: any) {
      console.error('Sign out error:', error);
      
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
      
      set({ 
        user: null, 
        error: 'Error during sign out, but you have been signed out locally',
        loading: false 
      });
    }
  },
}));