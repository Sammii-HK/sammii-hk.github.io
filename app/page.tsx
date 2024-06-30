import Image from "next/image";
import { ProjectView } from "./src/components/ProjectView";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <nav className="nav">Sammii</nav>
      <ProjectView />
    </main>
  );
}
