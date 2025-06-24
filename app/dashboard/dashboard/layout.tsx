import { getAuthStatus } from "@/lib/auth-helpers";

import { UserNav } from "@/components/user-nav";
import { NewQrCodeButton } from "@/components/new-qr-code-button";
import { COPYRIGHT_TEXT } from "@/lib/constants";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { session, isAuthenticated } = await getAuthStatus();

  return (
    <div className="flex min-h-screen flex-col p-4 sm:p-8 md:p-24">
      <div className="w-full max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">대시보드</h1>
            <p className="text-muted-foreground">
              안녕하세요, <b className="text-primary">{session?.user?.name}</b>
              님! QR 코드 활동을 확인해보세요.
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <NewQrCodeButton />
            <UserNav />
          </div>
        </div>
        {children}
        <div className="mt-auto pt-16 text-center text-sm text-muted-foreground">
          {COPYRIGHT_TEXT}
        </div>
      </div>
    </div>
  );
}
