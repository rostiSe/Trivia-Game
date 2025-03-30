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
  const cookieStore = await cookies(); // No await needed here for App Router

  // --- LOGGING START ---
  console.log("--- ProtectedLayout Server-Side Execution ---");
  const allCookies = cookieStore.getAll(); // Get all cookies as an array of { name, value }
  console.log("All cookies RECEIVED BY SERVER:", JSON.stringify(allCookies));
  // --- LOGGING END ---

  const tokenCookie = cookieStore.get("token"); // Get the specific cookie object
  const token = tokenCookie?.value; // Extract the value

  console.log("Attempting to read 'token' cookie. Found object:", tokenCookie ? 'Yes' : 'No');
  console.log("Value extracted:", token ? "[Token Value Present]" : "[No Token Value]");

  if (!token) {
    console.log("No token value found in cookies, redirecting to /sign-in.");
    // Make sure any previous redirects inside the try block are removed/handled here.
    return redirect("/sign-in");
  }

  // Token found, proceed with verification...
  try {
    console.log("Token found, proceeding to fetch /api/auth/me");
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/me`, {
      headers: {
        "Authorization": `Bearer ${token}`
      },
      cache: "no-store"
    });

    if (!res.ok) {
      console.error("Auth check API call failed:", res.status, res.statusText);
      // Attempt to read error body
      let errorBody = 'Could not read error body';
      try {
          errorBody = await res.text(); // Use text() first in case it's not JSON
          console.error("Auth check API error response body:", errorBody);
      } catch {}
      // Clear the potentially invalid cookie? This is tricky from Server Component.
      // Best practice is often to let the redirect to /sign-in handle login again.
      return redirect("/sign-in");
    }

    const userData = await res.json();
    console.log("Auth check successful.");

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
    console.error("Error during auth check fetch/processing:", error);
    return redirect("/sign-in");
  }
}