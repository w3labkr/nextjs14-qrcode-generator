import { UserNav } from "@/components/user-nav";
import { GithubBadge } from "@/components/github-badge";
import { COPYRIGHT_TEXT } from "@/lib/constants";

export default function QrCodeLayout2({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col p-4 sm:p-8 md:p-24">
      <header className="w-full max-w-4xl mx-auto">
        <GithubBadge />
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold">QR 코드 생성기</h1>
            </div>
            <UserNav />
          </div>
        </div>
        <div className="flex flex-col gap-4 mb-8">
          <h2 className="text-4xl font-bold">이메일 QR 코드 생성기</h2>
          <p className="text-muted-foreground">
            이메일 정보를 QR 코드로 변환하여 쉽게 공유하세요.
          </p>
        </div>
      </header>
      {children}
      <footer className="w-full mt-12 flex justify-center text-xs text-muted-foreground">
        {COPYRIGHT_TEXT}
      </footer>
    </div>
  );
}
