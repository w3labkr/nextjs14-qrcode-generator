import { Suspense } from "react";
import { COPYRIGHT_TEXT } from "@/lib/constants";

export default function QrCodeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      }
    >
      <main className="flex min-h-screen flex-col p-4 sm:p-8 md:p-24">
        {children}
        <footer className="w-full mt-12 flex justify-center text-xs text-muted-foreground">
          {COPYRIGHT_TEXT}
        </footer>
      </main>
    </Suspense>
  );
}
