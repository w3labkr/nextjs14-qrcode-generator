import Link from "next/link";
import { Button } from "@/components/ui/button";
import { GithubBadge } from "@/components/github-badge";
import { COPYRIGHT_TEXT } from "@/lib/constants";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col">
      <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8 pt-20 md:pt-8">
        <div className="text-center max-w-3xl mx-auto">
          <GithubBadge />

          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            QR 코드 생성기
          </h1>

          <p className="text-xl md:text-2xl text-muted-foreground mb-8">
            빠르고 쉬운 QR 코드 생성 도구
          </p>

          <div className="space-y-4 mb-12">
            <p className="text-lg text-muted-foreground">
              URL, 텍스트, 이메일, WiFi 등 다양한 형태의 QR 코드를 생성하세요.
            </p>
            <p className="text-base text-muted-foreground">
              로고 삽입, 색상 커스터마이징, 프레임 옵션 등 고급 기능을
              제공합니다.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/qrcode">
              <Button size="lg" className="w-full sm:w-auto">
                QR 코드 생성하기
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <footer className="w-full py-6 flex justify-center text-xs text-muted-foreground">
        {COPYRIGHT_TEXT}
      </footer>
    </main>
  );
}
