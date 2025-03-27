"use client";

import { Home, SkipBack, User } from "lucide-react";
import React, { useEffect, useState } from "react";
import Button from "./Button";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";

export default function NavigationBar() {
  const router = useRouter();
  const [hasToken, setHasToken] = useState(false);
  const user = useAuthStore((state: any) => state.user);
  const signOut = useAuthStore((state: any) => state.signOut);

  // Check for token on mount
  useEffect(() => {
    if (user){
        setHasToken(true);
    }else{
        setHasToken(false);
    }
  }, [user]); // run only once on mount
console.log(hasToken);
  // Temp SignOut handler
  const handleSignOut = () => {
    localStorage.removeItem("token");
    setHasToken(false);
    signOut();
    router.push("/sign-in");
  };
  return (
    <nav className="flex w-full items-center z-50 backdrop-blur-xl fixed top-0 justify-between p-4 border-b border-purple-900">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 cursor-pointer text-purple-200 hover:text-pink-600 transition-colors"
      >
        <SkipBack size={24} />
        <p>Back</p>
      </button>
      <div className="flex items-center gap-4">
        {!hasToken ? (
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
