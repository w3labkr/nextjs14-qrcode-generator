"use client";

import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

const errorMessages = {
  Configuration: "OAuth 설정에 문제가 있습니다.",
  AccessDenied: "접근이 거부되었습니다.",
  Verification: "인증에 실패했습니다.",
  OAuthAccountNotLinked:
    "이미 다른 방법으로 가입된 계정입니다. 동일한 이메일로 다른 소셜 로그인을 사용해보세요.",
  Default: "알 수 없는 오류가 발생했습니다.",
};

export default function AuthError() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  const errorMessage = error
    ? errorMessages[error as keyof typeof errorMessages] ||
      errorMessages.Default
    : errorMessages.Default;

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl text-red-600">로그인 오류</CardTitle>
        <CardDescription>
          로그인 중 오류가 발생했습니다. 다시 시도해주세요.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>
              {errorMessage}
              {process.env.NODE_ENV === "development" && (
                <div className="mt-2 text-xs opacity-70">
                  Error Code: {error}
                </div>
              )}
            </AlertDescription>
          </Alert>
        )}

        <Button className="w-full" asChild>
          <a href="/auth/signin">다시 로그인</a>
        </Button>
        <div className="text-center">
          <Button variant="link" asChild>
            <a href="/">홈으로 돌아가기</a>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
