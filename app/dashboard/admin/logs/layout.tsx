import { UserNav } from "@/components/user-nav";
import { COPYRIGHT_TEXT } from "@/lib/constants";
import { NewQrCodeButton } from "@/components/new-qr-code-button";

export default function AdminLogsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col p-4 sm:p-8 md:p-24">
      <header className="w-full max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold">관리자 로그 관리</h1>
            <p className="text-muted-foreground">
              시스템 로그, 오류 추적 및 사용자 활동을 모니터링합니다.
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <NewQrCodeButton />
            <UserNav />
          </div>
        </div>
      </header>
      <div className="w-full max-w-6xl mx-auto flex-1">{children}</div>
      <footer className="mt-16 flex justify-center text-sm text-muted-foreground">
        {COPYRIGHT_TEXT}
      </footer>
    </div>
  );
}
