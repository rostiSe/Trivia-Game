"use client"

import Card from '@/components/design/Card';
import LoadingButton from '@/components/form/loading-button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useRouter } from 'next/navigation';
import React, { useEffect } from 'react'

export default function SignInPage() {
    const [email, setEmail] = React.useState("");
    const [password, setPassword] = React.useState("");
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState("");
    const router = useRouter();

    // Check token only once on mount
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            router.replace('/select');
        }
    }, []);

    const handleSignIn = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/auth/sign-in`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email, password }),
                    credentials: "include",
                }
            );
            const data = await response.json();
            
            if (response.ok && data.token) {
                localStorage.setItem("token", data.token);
                router.replace('/select');
            } else {
                setError(data.error || "Login failed");
            }
        } catch (err) {
            console.error("Sign-in error:", err);
            setError("An unexpected error occurred");
        } finally {
            setLoading(false);
        }
    }

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
