import Image from "next/image";
import { ProjectView } from "./src/components/ProjectView";

export default function Home() {
  return (
    <main className="flex flex-col items-center relative overflow-hidden">
      <nav className="absolute bg-black z-10 w-full flex justify-center p-4">
        <div className="pt-3 logo stacked-radial" aria-label="logo svg" />
      </nav>
      <ProjectView />
    </main>
  );
}
