"use client";

import Card from '@/components/design/Card';
import LoadingButton from '@/components/form/loading-button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuthStore } from '@/store/auth.store';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';

export default function SignInPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();

    const handleSignIn = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
      
        const success = await useAuthStore.getState().signIn({ email, password });
      
        if (success) {
          router.push("/select");
        } else {
          setError(useAuthStore.getState().error || "Login failed");
        }
      
        setLoading(false);
      };

    return (
        <div className="flex items-center justify-center min-h-screen">
            <Card className="w-full max-w-md p-8">
                <form onSubmit={handleSignIn} className="space-y-6">
                    <div>
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <Label htmlFor="password">Password</Label>
                        <Input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    {error && (
                        <div className="text-red-500 text-sm">{error}</div>
                    )}
                    <LoadingButton
                        type="submit"
                        pending={loading}
                        onClick={() => {}}
                    >
                        Sign In
                    </LoadingButton>
                </form>
            </Card>
        </div>
    );
}
