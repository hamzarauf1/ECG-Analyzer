import { Heart } from "lucide-react";

export function AppHeader() {
  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center px-4">
        <div className="flex items-center gap-2">
          <Heart className="h-6 w-6 text-red-500" fill="#ef4444" />
          <span className="font-semibold text-lg tracking-tight">
            ECG Analyzer
          </span>
        </div>
        <div className="ml-auto flex items-center space-x-4">
          <span className="text-sm text-muted-foreground">Powered by AI</span>
        </div>
      </div>
    </header>
  );
}
