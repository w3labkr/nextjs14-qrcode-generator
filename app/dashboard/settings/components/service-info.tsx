"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import packageJson from "@/package.json";

export function ServiceInfo() {
  return (
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
            <p>v{packageJson.version}</p>
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
  );
}
