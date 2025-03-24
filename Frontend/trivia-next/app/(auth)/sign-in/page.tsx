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
                }
            );
            const data = await response.json();
      if (response.ok && data.token) {
        // Save the token in localStorage (or consider HttpOnly cookies for better security)
        localStorage.setItem("token", data.token);
        router.push("select")

        // Redirect to a protected route or homepage
        router.push("/");
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
    // Check if user is already authenticated
    useEffect(()=>{
        const token = localStorage.getItem('token')
        if(token){
            router.push('/select')
        }
    },[])
  return (
    <Card>
        <form  className='flex flex-col space-y-5' onSubmit={handleSignIn}>
            <Label htmlFor="email">Email</Label>
            <Input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />
            <Label htmlFor="password">Password</Label>
            <Input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />
            <LoadingButton type="submit" onClick={()=>console.log("Sign in")} pending={loading}>
                Sign In
            </LoadingButton>
            {error && <p>{error}</p>}
        </form>
    </Card >
  )
}
