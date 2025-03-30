import type { Metadata } from "next";
import NavigationBar from "@/components/design/navigation";
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
 
    return (
      <>
        <NavigationBar />
        <AuthWrapper>
          <Suspense fallback={<Loading />}>
            {children}
          </Suspense>
        </AuthWrapper>
      </>
    );
}