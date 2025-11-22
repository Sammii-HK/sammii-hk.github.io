import { PortfolioContainer } from "./src/components/PortfolioContainer";

export default function Home() {
  return (
    <main className="flex flex-col items-center relative overflow-hidden bg-white dark:bg-black text-black dark:text-white">
      <PortfolioContainer />
    </main>
  );
}
