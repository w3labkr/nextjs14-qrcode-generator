import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getAuthStatus } from "@/lib/auth-helpers";

export default async function AuthErrorLayout({
  children,
}: {
  children: ReactNode;
}) {
  const { session, isAuthenticated } = await getAuthStatus();

  if (isAuthenticated) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      {children}
    </div>
  );
}
