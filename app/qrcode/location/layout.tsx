import { UserNav } from "@/components/user-nav";
import { GithubBadge } from "@/components/github-badge";

export default function LocationQrCodeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <div className="w-full max-w-4xl mx-auto">
        {/* 상단 네비게이션 */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold">QR 코드 생성기</h1>
            </div>
            <UserNav />
          </div>
        </div>

        {/* 메인 제목과 설명 */}
        <div className="flex flex-col gap-4 mb-8">
          <h2 className="text-4xl font-bold">위치 QR 코드 생성기</h2>
          <p className="text-muted-foreground">
            위치 정보를 QR 코드로 변환하여 쉽게 공유하세요.
          </p>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center">
        <GithubBadge />
        {children}
      </div>
    </>
  );
}
