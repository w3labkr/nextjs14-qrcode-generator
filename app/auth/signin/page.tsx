"use client";

import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function SignIn() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">로그인</CardTitle>
          <CardDescription>
            QR 코드 히스토리 및 고급 기능을 이용하려면 로그인하세요
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            className="w-full"
            onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
          >
            Google로 로그인
          </Button>
          <div className="text-center">
            <Button variant="link" asChild>
              <a href="/">로그인 없이 계속하기</a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
