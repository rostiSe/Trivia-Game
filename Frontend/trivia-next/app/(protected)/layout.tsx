import type { Metadata } from "next";
import NavigationBar from "@/components/design/navigation";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import Loading from "./loading";
import AuthWrapper from "../(auth)/AuthWrapper";

export const metadata: Metadata = {
  title: "Trivia App",
  description: "A fun trivia application",
};

export default async function ProtectedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Get the token cookie
  const cookieStore = cookies();
  const token = (await cookieStore).get("token")?.value;
  
  // If no token exists in cookies, redirect to sign-in
  if (!token) {
    console.log("No token found in cookies, redirecting");
    return redirect("/sign-in");
  }
  
  try {
    // Make the auth check with the token
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/me`, {
      headers: { 
        "Authorization": `Bearer ${token}`
      },
      cache: "no-store" 
    });
     

    
    const userData = await res.json();
    
    return (
      <>
        <NavigationBar />
        <AuthWrapper userFromServer={userData} token={token}>
          <Suspense fallback={<Loading />}>
            {children}
          </Suspense>
        </AuthWrapper>
      </>
    );
  } catch (error) {
    console.error("Auth check error:", error);
    return redirect("/sign-in");
  }
}