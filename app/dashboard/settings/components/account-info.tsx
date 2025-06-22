"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { User } from "lucide-react";
import { Session } from "next-auth";

interface AccountInfoProps {
  session: Session | null;
}

export function AccountInfo({ session }: AccountInfoProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <User className="h-5 w-5" />
          <CardTitle>계정 정보</CardTitle>
        </div>
        <CardDescription>로그인한 계정의 기본 정보입니다.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground">
              이름
            </label>
            <p className="text-lg">{session?.user?.name || "정보 없음"}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">
              이메일
            </label>
            <p className="text-lg">{session?.user?.email || "정보 없음"}</p>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          계정 정보는 Google OAuth를 통해 제공되며, 본 서비스에서는 수정할 수
          없습니다.
        </p>
      </CardContent>
    </Card>
  );
}
