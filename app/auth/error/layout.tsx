import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/auth";

interface AuthLayoutProps {
  children: ReactNode;
}

export default async function AuthErrorLayout({ children }: AuthLayoutProps) {
  const session = await auth();

  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      {children}
    </div>
  );
}
