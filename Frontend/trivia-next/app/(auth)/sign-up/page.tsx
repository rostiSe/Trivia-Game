"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation"; // For redirection after signup
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function SignUpPage() {
  // State for form fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // State for handling loading and errors
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const router = useRouter();

  // Handler for form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent default form submission behavior
    setLoading(true);
    setError("");
    console.log("Submitting form:", JSON.stringify({ name, email, password }));

    try {
      // Send a POST request to your registration endpoint
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/sign-up`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password }),
        }
      );
      const data = await response.json();
      
      if (response.ok) {
        // Successful signup: you can redirect to a login page or home page
        router.push("/sign-in");
      } else {
        // Show error message returned by your API
        setError(data.error || "Registration failed");
      }
    } catch (err) {
      console.error("Signup error:", err);
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-md">
      <h1 className="text-2xl font-bold mb-4">Sign Up</h1>
      
      {error && <p className="text-red-500 mb-4">{error}</p>}

      <form onSubmit={handleSubmit}>
        {/* Name Field */}
        <Label htmlFor="name" className="block mb-2 ">
          Name
          <Input
            name="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border p-2 w-full mt-1"
            placeholder="Your name"
            required
          />
        </Label>

        {/* Email Field */}
        <Label htmlFor="email" className="block mb-2">
          Email
          <Input
            name="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border p-2 w-full mt-1"
            placeholder="you@example.com"
            required
          />
        </Label>

        {/* Password Field */}
        <Label htmlFor="password" className="block mb-2">
          Password
          <Input
            name="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border p-2 w-full mt-1"
            placeholder="Your password"
            required
          />
        </Label>

        <Button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white p-2 w-full mt-4 disabled:opacity-50"
        >
          {loading ? "Signing up..." : "Sign Up"}
        </Button>
      </form>
    </div>
  );
}
