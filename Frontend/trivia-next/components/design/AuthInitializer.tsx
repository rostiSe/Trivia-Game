'use client';

import { useAuthStore } from '@/store/auth.store';
import { useEffect } from 'react';

export default function AuthInitializer() {
  const { initialize } = useAuthStore();

  // Initialize auth store on mount
  useEffect(() => {
    console.log('Initializing auth store at app level');
    initialize();
  }, [initialize]);

  // This component doesn't render anything
  return null;
} 