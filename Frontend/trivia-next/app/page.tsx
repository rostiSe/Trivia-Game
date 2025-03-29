import Button from "@/components/design/Button";
import NavigationBar from "@/components/design/navigation";
import { Play, Save, Users } from "lucide-react";
import Link from "next/link";

export default function App() {
  return (
    <div className="container  text-white">
      <NavigationBar />
      <main className="flex flex-col items-center justify-center  px-1">
        <h2 className="text-3xl font-bold mb-4 text-center">Erstellen Sie ein Quiz, das Spaß macht</h2>
        <p className="text-lg text-center">
          Test your knowledge and see how you rank against others.
        </p>
        <Button className="w-full max-w-[20rem] mt-10">
          <Link className="flex items-center gap-2 justify-center" href="/select">
          <Play className="inline"/>Play Now
          </Link>
        </Button>
        <Button className="w-full  max-w-[20rem] mt-3">
          <Link className="" href="/questions">
              <Save className="inline"/> Saved Questions
          </Link>
        </Button>
        <Button variant="outline" className="w-full  max-w-[20rem] mt-3">
          <Link className="" href="/friends">
              <Users className="inline"/> Friends
          </Link>
        </Button>
      </main>
    </div>
  );
}