import { Navbar } from "./src/components/Navbar";
import { ProjectView } from "./src/components/ProjectView";

export default function Home() {  
  return (
    <main className="flex flex-col items-center relative overflow-hidden">
      <Navbar />
      <ProjectView />
    </main>
  );
}
