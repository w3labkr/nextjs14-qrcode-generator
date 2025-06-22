"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Shield } from "lucide-react";
import AccountDeletion from "@/components/account-deletion";

export function PrivacyAndSecurity() {
  return (
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
          <h4 className="font-medium text-blue-900 mb-2">개인정보 처리 방침</h4>
          <p className="text-sm text-blue-700 mb-3">
            본 서비스는 최소한의 개인정보만 수집하며, 제3자와 공유하지 않습니다.
          </p>
          <ul className="text-xs text-blue-600 space-y-1">
            <li>• 수집 정보: Google OAuth 기본 프로필 (이름, 이메일)</li>
            <li>• 목적: QR 코드 히스토리 관리 및 개인화 서비스 제공</li>
            <li>• 보관 기간: 계정 삭제 시까지</li>
            <li>• 암호화: 세션 정보 및 민감 데이터 암호화</li>
          </ul>
        </div>

        <div className="p-4 border border-red-200 rounded-lg bg-red-50">
          <div className="mb-4">
            <h4 className="font-medium text-red-900">계정 삭제</h4>
            <p className="text-sm text-red-700">
              계정과 모든 데이터를 영구적으로 삭제합니다. 이 작업은 되돌릴 수
              없습니다.
            </p>
          </div>
          <AccountDeletion />
        </div>
      </CardContent>
    </Card>
  );
}
