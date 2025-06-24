import { Suspense } from "react";
import { COPYRIGHT_TEXT } from "@/lib/constants";
import { LoadingSpinner } from "@/components/loading-spinner";

export default function QrCodeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <main className="flex min-h-screen flex-col p-4 sm:p-8 md:p-24">
        {children}
        <footer className="w-full mt-12 flex justify-center text-xs text-muted-foreground">
          {COPYRIGHT_TEXT}
        </footer>
      </main>
    </Suspense>
  );
}
