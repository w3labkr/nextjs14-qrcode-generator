"use client";

import { signIn } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Mail, Loader2, Code } from "lucide-react";

export default function SignIn() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [isDevLoading, setIsDevLoading] = useState(false);
  const [isDevelopment, setIsDevelopment] = useState(false);

  useEffect(() => {
    // 클라이언트 사이드에서 개발 모드 감지
    setIsDevelopment(
      window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1" ||
        window.location.hostname.includes("localhost"),
    );
  }, []);

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    try {
      const result = await signIn("resend", {
        email,
        redirect: false,
        callbackUrl: "/dashboard",
      });

      if (result?.ok) {
        setEmailSent(true);
      }
    } catch (error) {
      console.error("매직 링크 전송 실패:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDevLogin = async () => {
    console.log("handleDevLogin 시작");
    setIsDevLoading(true);

    try {
      console.log("NextAuth.js를 통한 개발 로그인 시도 중...");

      const result = await signIn("dev-login", {
        email: "dev@example.com",
        redirect: false,
        callbackUrl: "/dashboard",
      });

      console.log("개발 로그인 결과:", result);

      if (result?.ok) {
        console.log("로그인 성공, 대시보드로 리다이렉트");
        window.location.href = "/dashboard";
      } else if (result?.error) {
        console.error("개발 로그인 실패:", result.error);
        alert(`로그인에 실패했습니다: ${result.error}`);
      } else {
        console.error("알 수 없는 로그인 실패");
        alert("로그인에 실패했습니다.");
      }
    } catch (error) {
      console.error("개발 로그인 에러:", error);
      if (error instanceof Error) {
        console.error("에러 상세:", error.message, error.stack);
      }
      alert(
        `로그인 처리 중 오류가 발생했습니다: ${error instanceof Error ? error.message : "알 수 없는 오류"}`,
      );
    } finally {
      console.log("handleDevLogin 완료");
      setIsDevLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
              <Mail className="h-6 w-6 text-blue-600" />
            </div>
            <CardTitle className="text-2xl">이메일을 확인해 주세요</CardTitle>
            <CardDescription>
              {email}로 로그인 링크를 전송했습니다.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="mb-4 text-sm text-gray-600">
              이메일함을 확인하시고 로그인 링크를 클릭해 주세요.
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setEmailSent(false);
                setEmail("");
              }}
            >
              다른 이메일로 시도
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">로그인</CardTitle>
          <CardDescription>
            QR 코드 히스토리 및 고급 기능을 이용하려면 로그인하세요
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 매직 링크 로그인 */}
          <div className="space-y-4">
            <form onSubmit={handleEmailSignIn} className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="email">이메일 주소</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading || !email}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    로그인 링크 전송 중...
                  </>
                ) : (
                  <>
                    <Mail className="mr-2 h-4 w-4" />
                    매직 링크로 로그인
                  </>
                )}
              </Button>
            </form>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-gray-500">또는</span>
            </div>
          </div>

          {/* Google 로그인 */}
          <Button
            className="w-full"
            variant="outline"
            onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
          >
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Google로 로그인
          </Button>

          <div className="text-center">
            <Button variant="link" asChild>
              <a href="/">로그인 없이 계속하기</a>
            </Button>
          </div>

          {/* 개발 모드에서만 표시되는 임시 로그인 버튼 */}
          {isDevelopment && (
            <>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <Separator className="w-full" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-gray-500">개발 모드</span>
                </div>
              </div>

              <Button
                className="w-full"
                variant="destructive"
                onClick={handleDevLogin}
                disabled={isDevLoading}
              >
                {isDevLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    임시 로그인 중...
                  </>
                ) : (
                  <>
                    <Code className="mr-2 h-4 w-4" />
                    개발자 임시 로그인
                  </>
                )}
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
