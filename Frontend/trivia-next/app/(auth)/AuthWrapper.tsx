'use client';

import { useAuthStore } from '@/store/auth.store';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface AuthWrapperProps {
  children: React.ReactNode;
  userFromServer?: any; // Replace with the actual type if known
}

export default function AuthWrapper({ userFromServer, children }: AuthWrapperProps) {
  const { user, setUser, initialize } = useAuthStore();
  const [isInitialized, setIsInitialized] = useState(false);
  const router = useRouter();
  
  // Run once on component mount
  useEffect(() => {
    // Safely initialize store (client-side only)
    initialize();
    
    // If we have server-side user data, set it immediately
    if (userFromServer && userFromServer.id) {
      console.log("Setting user from server data:", userFromServer);
      setUser(userFromServer);
    }
    
    setIsInitialized(true);
  }, [initialize, setUser, userFromServer]);
  
  // If we're still initializing, show loading state
  if (!isInitialized) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-4 text-sm text-gray-200">Loading your session...</p>
      </div>
    );
  }

  // If we're initialized and have either user from store or server, render children
  if (user || userFromServer) {
    return <>{children}</>;
  }
  
  // If we're initialized but have no user data, redirect to sign-in
  // This is a fallback - normally the redirect happens in layout.tsx
  router.replace('/sign-in');
  return null;
}