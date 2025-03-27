// app/protected/AuthWrapper.tsx
'use client';

import { useAuthStore } from '@/store/auth.store';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

interface AuthWrapperProps {
  userFromServer?: any;
  children: React.ReactNode;
}

export default function AuthWrapper({ userFromServer, children }: AuthWrapperProps) {
  const { user, setUser } = useAuthStore();
  const [isInitialized, setIsInitialized] = useState(false);

  // First, handle server-provided user data if available
  useEffect(() => {
    if (userFromServer) {
      setUser(userFromServer);
      setIsInitialized(true);
    } else {
      // If no server data, check if we have stored user data
      const storedUser = localStorage.getItem('user');
      
      if (storedUser) {
        try {
          const userData = JSON.parse(storedUser);
          setUser(userData);
        } catch (e) {
          console.error('Failed to parse stored user data', e);
          localStorage.removeItem('user');
        }
      }
      
      setIsInitialized(true);
    }
  }, [userFromServer, setUser]);

  // Show a nice loading state
  if (!isInitialized || (!user && userFromServer)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-4 text-sm text-gray-200">Loading your session...</p>
      </div>
    );
  }

  // For protected routes that require AuthWrapper with server data
  // If there's no user and we've already tried to initialize, show nothing
  // The layout.tsx will handle the redirect
  if (!user && userFromServer) {
    return null;
  }

  return <>{children}</>;
}
