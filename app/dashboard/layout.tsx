import { redirect } from "next/navigation";
import { getAuthStatus } from "@/lib/auth-helpers";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { session, isAuthenticated } = await getAuthStatus();

  if (!isAuthenticated) {
    redirect("/auth/signin");
  }

  return <>{children}</>;
}
