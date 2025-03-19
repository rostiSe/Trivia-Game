"use client";

import Button from "@/components/design/Button";
import Link from "next/link";

export default function App() {
  return (
    <div className="container bg-gradient-to-b from-indigo-900 to-purple-900 text-white">
      
      <main className="flex flex-col items-center justify-center h-screen px-1">
        <h2 className="text-3xl font-bold mb-4 text-center">Erstellen Sie ein Quiz, das Spaß macht</h2>
        <p className="text-lg text-center">
          Test your knowledge and see how you rank against others.
        </p>
        <Button className="w-full max-w-[20rem] mt-10">
          <Link href="/select">
              Play Now
          </Link>
        </Button>
        <Button className="w-full max-w-[20rem] mt-3">
          <Link href="/questions">
              Saved Questions
          </Link>
        </Button>
      </main>
    </div>
  );
}