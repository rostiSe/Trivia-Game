// app/protected/AuthWrapper.tsx
'use client';

import { useAuthStore } from '@/store/auth.store';
import { useEffect } from 'react';

interface AuthWrapperProps {
  userFromServer: any
  children: React.ReactNode;
}

export default function AuthWrapper({ userFromServer, children }: AuthWrapperProps) {
  const { user, setUser } = useAuthStore();

  // Hydrate the Zustand store with the server-provided user
  useEffect(() => {
    if (!user && userFromServer) {
      setUser(userFromServer);
    }
  }, [user, userFromServer, setUser]);

  console.log(user);
  console.log(userFromServer);
  // Optionally, show a loading state until the store is updated
  if (!user) return <div>Loading... Client</div>;

  return <>{children}</>;
}
