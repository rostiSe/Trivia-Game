'use client';

import { useAuthStore } from '@/store/auth.store';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

interface AuthWrapperProps {
  children: React.ReactNode;
  userFromServer?: any;
  token?: string;
}

export default function AuthWrapper({ userFromServer, token, children }: AuthWrapperProps) {
  const { user, setUser } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Function to handle auth initialization
    async function initAuth() {
      // If we have server-provided user data, use it
      if (userFromServer && token) {
        console.log("Using server-provided user data:", userFromServer);
        
        // Store token in localStorage for client-side requests
        localStorage.setItem('token', token);
        
        // Update auth store with user data
        setUser(userFromServer);
        setIsLoading(false);
        return;
      }
      
      // Otherwise, check if we have a stored token/user
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      
      if (storedUser && storedToken) {
        try {
          setUser(JSON.parse(storedUser));
          setIsLoading(false);
        } catch (e) {
          console.error("Error parsing stored user data", e);
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    }
    
    initAuth();
  }, [userFromServer, token, setUser]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-4 text-sm text-gray-200">Loading your session...</p>
      </div>
    );
  }

  return <>{children}</>;
}