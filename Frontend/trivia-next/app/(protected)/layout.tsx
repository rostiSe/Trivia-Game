import type { Metadata } from "next";
import NavigationBar from "@/components/design/navigation";
import { cookies } from "next/headers";
import { redirect, useRouter } from "next/navigation";

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
  const router = useRouter();
  // Make server-side auth check simple and reliable
  try {
    // Call the authentication check endpoint with the cookie header
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/me`, {
      headers: { cookie: cookieHeader },
      next: { revalidate: 0 } // Don't cache this request
    });
    console.log(await res.json())
    // If not authenticated, redirect to login
    if (!res.ok) {
      return router.replace("/sign-in");
    }

    // If authenticated, render the protected layout
    return (
      <>
        <NavigationBar />
        {children}
      </>
    );
  } catch (error) {
    console.error("Authentication check error:", error);
    return redirect("/sign-in");
  }
}
