import { ReactNode } from "react";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { AccessDeniedAlert } from "@/components/access-denied-alert";
import { getAdminEmails } from "@/lib/env-validation";

interface AdminLayoutProps {
  children: ReactNode;
}

/**
 * 관리자 권한 확인 함수
 */
async function checkAdminAccess(
  email: string | null | undefined,
): Promise<boolean> {
  if (!email) return false;

  const adminEmails = getAdminEmails();
  return adminEmails.includes(email);
}

export default async function AdminLayout({ children }: AdminLayoutProps) {
  const session = await auth();

  if (!session?.user?.email) {
    redirect("/auth/signin");
  }

  const isAdmin = await checkAdminAccess(session.user.email);

  if (!isAdmin) {
    return <AccessDeniedAlert />;
  }

  return <>{children}</>;
}
