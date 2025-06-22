"use client";

import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { UserNav } from "@/components/user-nav";
import { Trash2, Download, Shield, User } from "lucide-react";
import Link from "next/link";
import DataManager from "@/components/data-manager";

export default function SettingsPage() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="flex min-h-screen flex-col p-4 sm:p-8 md:p-24">
        <div className="w-full max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">설정</h1>
            <UserNav />
          </div>
          <div className="space-y-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="h-32 bg-gray-200 animate-pulse rounded-lg"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="flex min-h-screen flex-col p-4 sm:p-8 md:p-24">
        <div className="w-full max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">설정</h1>
            <UserNav />
          </div>
          <Card className="max-w-md mx-auto">
            <CardHeader className="text-center">
              <CardTitle>로그인이 필요합니다</CardTitle>
              <CardDescription>
                설정을 관리하려면 로그인해주세요.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button asChild>
                <Link href="/auth/signin">로그인</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col p-4 sm:p-8 md:p-24">
      <div className="w-full max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">설정</h1>
            <p className="text-muted-foreground">
              계정 설정과 개인정보를 관리하세요.
            </p>
          </div>
          <UserNav />
        </div>

        <div className="space-y-6">
          {/* 계정 정보 */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <User className="h-5 w-5" />
                <CardTitle>계정 정보</CardTitle>
              </div>
              <CardDescription>
                로그인한 계정의 기본 정보입니다.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    이름
                  </label>
                  <p className="text-lg">
                    {session?.user?.name || "정보 없음"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    이메일
                  </label>
                  <p className="text-lg">
                    {session?.user?.email || "정보 없음"}
                  </p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                계정 정보는 Google OAuth를 통해 제공되며, 본 서비스에서는 수정할
                수 없습니다.
              </p>
            </CardContent>
          </Card>

          {/* 데이터 관리 */}
          <DataManager />

          {/* 개인정보 및 보안 */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                <CardTitle>개인정보 및 보안</CardTitle>
              </div>
              <CardDescription>
                개인정보 보호와 계정 보안에 관한 설정입니다.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">
                  개인정보 처리 방침
                </h4>
                <p className="text-sm text-blue-700 mb-3">
                  본 서비스는 최소한의 개인정보만 수집하며, 제3자와 공유하지
                  않습니다.
                </p>
                <ul className="text-xs text-blue-600 space-y-1">
                  <li>• 수집 정보: Google OAuth 기본 프로필 (이름, 이메일)</li>
                  <li>• 목적: QR 코드 히스토리 관리 및 개인화 서비스 제공</li>
                  <li>• 보관 기간: 계정 삭제 시까지</li>
                  <li>• 암호화: 세션 정보 및 민감 데이터 암호화</li>
                </ul>
              </div>

              <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50">
                <div>
                  <h4 className="font-medium text-red-900">계정 삭제</h4>
                  <p className="text-sm text-red-700">
                    계정과 모든 데이터를 영구적으로 삭제합니다. 이 작업은 되돌릴
                    수 없습니다.
                  </p>
                </div>
                <Button variant="destructive" disabled>
                  <Trash2 className="h-4 w-4 mr-2" />
                  계정 삭제 (준비 중)
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* 서비스 정보 */}
          <Card>
            <CardHeader>
              <CardTitle>서비스 정보</CardTitle>
              <CardDescription>
                QR 코드 생성기 서비스에 대한 정보입니다.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    버전
                  </label>
                  <p>v1.0.9</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    라이선스
                  </label>
                  <p>MIT License</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" asChild>
                  <a
                    href="https://github.com/w3labkr/nextjs14-qrcode-generator"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    GitHub
                  </a>
                </Button>
                <Button variant="outline" size="sm" disabled>
                  문서 (준비 중)
                </Button>
                <Button variant="outline" size="sm" disabled>
                  지원 (준비 중)
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
