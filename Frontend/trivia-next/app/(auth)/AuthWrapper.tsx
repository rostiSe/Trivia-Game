// app/protected/AuthWrapper.tsx
'use client';

import { useAuthStore } from '@/store/auth.store';
import { useEffect } from 'react';


// @ts-expect-error
export default function AuthWrapper({ userFromServer, children }) {
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
