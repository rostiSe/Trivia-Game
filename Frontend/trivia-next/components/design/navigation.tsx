"use client";

import { Home, SkipBack, User } from "lucide-react";
import React, { useEffect, useState } from "react";
import Button from "./Button";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function NavigationBar() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  // Check authentication status on mount and when localStorage changes
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      setIsLoggedIn(!!token);
    };
    
    // Check initially
    checkAuth();
    
    // Set up event listener for storage changes (for multi-tab support)
    window.addEventListener('storage', checkAuth);
    
    // Clean up
    return () => window.removeEventListener('storage', checkAuth);
  }, []);

  // Sign out handler
  const handleSignOut = async () => {
    try {
      // Call the sign-out API
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/sign-out`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      // Clear local storage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Redirect to sign-in
      window.location.href = '/sign-in';
    } catch (error) {
      console.error("Error signing out:", error);
      
      // Still clear localStorage and redirect on error
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/sign-in';
    }
  };

  return (
    <nav className="flex w-full items-center z-50 backdrop-blur-xl fixed top-0 left-0 justify-between p-4 border-b border-purple-900">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 cursor-pointer text-purple-200 hover:text-pink-600 transition-colors"
      >
        <SkipBack size={24} />
        <p>Back</p>
      </button>
      <div className="flex items-center gap-4">
        {!isLoggedIn ? (
          <Button
            variant="outline"
            className="flex shadow-none py-2 cursor-pointer items-center justify-center"
          >
            <Link className="flex items-center" href="/sign-in">
              <User size={18} className="mr-2" />
              Sign-In
            </Link>
          </Button>
        ) : (
          <Button
            variant="outline"
            onClick={handleSignOut}
            className="flex border-none shadow-none py-2 cursor-pointer items-center justify-center"
          >
            <User size={18} className="mr-2" />
            Sign-Out
          </Button>
        )}
        <Button
          variant="primary"
          className="flex shadow-none cursor-pointer items-center justify-center"
        >
          <Link className="flex items-center" href="/">
            <Home size={18} />
          </Link>
        </Button>
      </div>
    </nav>
  );
}
