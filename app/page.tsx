import { AppHeader } from "@/components/app-header";
import { ECGAnalyzer } from "@/components/ecg-analyzer";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      <AppHeader />
      <div className=" px-4 py-8 md:py-12">
        <ECGAnalyzer />
      </div>
    </main>
  );
}
