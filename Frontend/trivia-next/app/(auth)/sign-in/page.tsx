"use client";

import Card from '@/components/design/Card';
import LoadingButton from '@/components/form/loading-button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import React, { useState } from 'react';

export default function SignInPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSignIn = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            console.log("Attempting to sign in...");
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/auth/sign-in`,
                {
                    method: "POST",
                    headers: { 
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ email, password }),
                    credentials: "include",
                }
            );
            
            console.log("Sign-in response status:", response.status);
            const data = await response.json();
            console.log("Sign-in response data:", data);
            
            if (response.ok && data.token) {
                // Store token in localStorage
                localStorage.setItem("token", data.token);
                console.log("Token saved, redirecting...");
                
                // Use direct navigation instead of Next.js router
                window.location.href = '/select';
            } else {
                setError(data.error || "Login failed");
            }
        } catch (err) {
            console.error("Sign-in error:", err);
            // @ts-expect-error stupid err
            setError(err.message || "An unexpected error occurred");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen">
            <Card className="w-full max-w-md p-8">
                <h1 className="text-2xl font-bold mb-6 text-center">Sign In</h1>
                <form onSubmit={handleSignIn} className="space-y-6">
                    <div>
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            disabled={loading}
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
                            disabled={loading}
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
