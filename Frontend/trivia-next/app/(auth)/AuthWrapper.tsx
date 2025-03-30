// AuthWrapper.tsx (Client-Side Focused)
'use client';

import { useAuthStore } from '@/store/auth.store';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function AuthWrapper({ children }: { children: React.ReactNode }) {
  const { user, setUser } = useAuthStore(); // Assuming you have clearAuth
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      // Check Zustand first (user might be set from login page)
      if (user) {
         console.log("AuthWrapper: User already in store.");
         setIsLoading(false);
         return;
      }

      // Check localStorage for token (set during login)
      const storedToken = localStorage.getItem('token');
      if (!storedToken) {
        console.log("AuthWrapper: No token found.");
        router.push('/sign-in'); // Redirect if no token
        return; // Stop loading early
      }

      // Token found, verify it client-side against Render backend
      try {
        console.log("AuthWrapper: Verifying token client-side...");
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/me`, {
          method: 'GET', // Or whatever your /me endpoint uses
          headers: {
            // Authorization header might be needed if backend prefers it,
            // but the cookie should also be sent if credentials: include is used
            'Authorization': `Bearer ${storedToken}`
          },
          credentials: 'include', // IMPORTANT: Sends cookies (like the Render one) on cross-origin requests
        });

        if (response.ok) {
          const userData = await response.json();
          console.log("AuthWrapper: Token verified, setting user.");
          setUser(userData);
        } else {
          console.log("AuthWrapper: Token verification failed.");
          localStorage.removeItem('token'); // Clear invalid token
          router.push('/sign-in');
        }
      } catch (error) {
        console.error("AuthWrapper: Error verifying token:", error);
        localStorage.removeItem('token');
        router.push('/sign-in');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [user, setUser, router]); // Add dependencies

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-4 text-sm text-gray-200">Checking session...</p>
      </div>
    );
  }

  // Render children only if loading is finished AND user is set (or logic dictates)
  // This check prevents flashing content before redirect
  if (!user) {
      // This case should ideally be handled by the redirect in useEffect,
      // but as a fallback, render null or a message.
      // Returning loading might be better if redirect hasn't happened yet.
      return null; // Or loading indicator again
  }

  return <>{children}</>;
}