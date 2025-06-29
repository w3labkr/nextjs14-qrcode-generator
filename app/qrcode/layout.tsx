import { UserNav } from "@/components/user-nav";
import { GithubBadge } from "@/components/github-badge";
import { HistoryButton } from "@/components/history-button";
import { COPYRIGHT_TEXT } from "@/lib/constants";
import { appConfig } from "@/config/app";

export default function QrCodeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col p-4 sm:p-8 md:p-24">
      <header className="w-full max-w-6xl mx-auto">
        <GithubBadge />
        <div className="flex justify-between items-center mb-8">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold">
              QR 코드 생성기
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                {appConfig.version}
              </span>
            </h1>
            <p className="text-muted-foreground">
              이메일 정보를 QR 코드로 변환하여 쉽게 공유하세요.
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <HistoryButton />
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
