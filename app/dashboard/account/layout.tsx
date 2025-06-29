import { UserNav } from "@/components/user-nav";
import { COPYRIGHT_TEXT } from "@/lib/constants";
import { NewQrCodeButton } from "@/components/new-qr-code-button";

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col p-4 sm:p-8 md:p-24">
      <header className="w-full max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold">계정 관리</h1>
            <p className="text-muted-foreground">
              계정 정보를 확인하고 보안 설정을 관리하세요.
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
