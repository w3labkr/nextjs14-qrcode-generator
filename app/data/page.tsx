"use client";

import { useSession } from "next-auth/react";
import DataManager from "@/components/data-manager";
import { UserNav } from "@/components/user-nav";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Database, ArrowLeft } from "lucide-react";

export default function DataPage() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="flex min-h-screen flex-col p-4 sm:p-8 md:p-24">
        <div className="w-full max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">데이터 관리</h1>
            <UserNav />
          </div>
          <div className="animate-pulse space-y-6">
            <div className="h-64 bg-gray-200 rounded-lg" />
            <div className="h-32 bg-gray-200 rounded-lg" />
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
            <h1 className="text-3xl font-bold">데이터 관리</h1>
            <UserNav />
          </div>
          <Card className="max-w-md mx-auto">
            <CardHeader className="text-center">
              <CardTitle>로그인이 필요합니다</CardTitle>
              <CardDescription>
                데이터 관리 기능을 사용하려면 로그인해주세요.
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
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/settings">
                <ArrowLeft className="h-4 w-4 mr-2" />
                설정으로 돌아가기
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold">데이터 관리</h1>
              <p className="text-muted-foreground mt-2">
                QR 코드와 템플릿 데이터를 백업하고 복원하세요.
              </p>
            </div>
          </div>
          <UserNav />
        </div>

        <div className="space-y-6">
          {/* 데이터 관리자 */}
          <DataManager />

          {/* 추가 정보 카드 */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                <CardTitle>데이터 형식 안내</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium">내보내기 데이터 포함 항목</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• QR 코드 히스토리 (유형, 내용, 설정)</li>
                    <li>• 저장된 템플릿 (이름, 설정, 기본 여부)</li>
                    <li>• 즐겨찾기 정보</li>
                    <li>• 생성/수정 날짜</li>
                    <li>• 사용자 기본 정보</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">가져오기 옵션</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• 기존 데이터에 추가 (기본)</li>
                    <li>• 기존 데이터 덮어쓰기</li>
                    <li>• 중복 데이터 자동 필터링</li>
                    <li>• 부분 가져오기 지원</li>
                  </ul>
                </div>
              </div>

              <div className="pt-4 border-t">
                <h4 className="font-medium mb-2">데이터 보안</h4>
                <p className="text-sm text-muted-foreground">
                  내보낸 데이터에는 개인 식별 정보(이메일, 계정 ID 등)가
                  포함되지 않습니다. QR 코드 내용과 설정 정보만 포함되어
                  안전하게 공유할 수 있습니다.
                </p>
              </div>

              <div className="pt-4 border-t">
                <h4 className="font-medium mb-2">사용 사례</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
                  <div>
                    <p className="font-medium text-foreground">백업</p>
                    <p>정기적으로 데이터를 내보내서 로컬에 백업</p>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">계정 이전</p>
                    <p>다른 Google 계정으로 데이터 이동</p>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">팀 공유</p>
                    <p>템플릿을 팀원들과 공유</p>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">복원</p>
                    <p>실수로 삭제한 데이터 복구</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 관련 링크 */}
          <Card>
            <CardHeader>
              <CardTitle>관련 기능</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button variant="outline" asChild>
                  <Link href="/history">QR 코드 히스토리</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/templates">템플릿 관리</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/dashboard">대시보드</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
