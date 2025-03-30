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
  // Get all cookies from the request
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();
  console.log("Cookie header:", cookieHeader);
  
  // Make server-side auth check simple and reliable
  try {
    // Call the authentication check endpoint with the cookie header
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/me`, {
      headers: { cookie: cookieHeader },
      next: { revalidate: 0 } // Don't cache this request
    });
     
    console.log("Auth check response:", res);
    // Only try to parse JSON if the response was successful
    if (!res.ok){
      console.error("Authentication check failed:", res.statusText);
      return redirect("/sign-in");
    }const userData = await res.json();

    
    console.log("Auth check succeeded, user data:", userData);


    // If authenticated, render the protected layout
    return (
      <>
        <NavigationBar />
        <AuthWrapper userFromServer={userData}>
        <Suspense fallback={<Loading />}>
          {children}
        </Suspense>
        </AuthWrapper>
      </>
    );
  } catch (error) {
    console.error("Authentication check error:", error);
    return redirect("/sign-in");
  }
}
