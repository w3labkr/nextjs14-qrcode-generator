"use client";

import { AlertTriangle, Download, Settings } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function DownloadTroubleshootDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="text-muted-foreground">
          <AlertTriangle className="h-4 w-4 mr-2" />
          다운로드 문제 해결
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            파일 다운로드 문제 해결
          </DialogTitle>
          <DialogDescription>
            파일이 다운로드되지 않을 때 확인해야 할 사항들입니다.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Alert>
            <Settings className="h-4 w-4" />
            <AlertTitle>브라우저 설정 확인</AlertTitle>
            <AlertDescription className="space-y-2">
              <div>
                1. <strong>팝업 차단 해제</strong>: 브라우저에서 이 사이트의
                팝업을 허용해주세요.
              </div>
              <div>
                2. <strong>다운로드 설정</strong>: 브라우저 설정에서 자동
                다운로드가 허용되어 있는지 확인하세요.
              </div>
              <div>
                3. <strong>저장 위치</strong>: 다운로드 폴더 권한을 확인하세요.
              </div>
            </AlertDescription>
          </Alert>

          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>일반적인 해결 방법</AlertTitle>
            <AlertDescription className="space-y-2">
              <div>
                • <strong>페이지 새로고침</strong> 후 다시 시도해보세요.
              </div>
              <div>
                • <strong>다른 브라우저</strong>에서 시도해보세요 (Chrome,
                Firefox, Safari 등).
              </div>
              <div>
                • <strong>시크릿 모드</strong>에서 시도해보세요.
              </div>
              <div>
                • 브라우저 확장 프로그램을 일시적으로 <strong>비활성화</strong>
                해보세요.
              </div>
            </AlertDescription>
          </Alert>

          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>브라우저별 설정</AlertTitle>
            <AlertDescription className="space-y-2">
              <div>
                <strong>Chrome</strong>: 설정 → 개인정보 보호 및 보안 → 사이트
                설정 → 팝업 및 리디렉션
              </div>
              <div>
                <strong>Firefox</strong>: 설정 → 개인정보 보호 및 보안 → 권한 →
                팝업 차단
              </div>
              <div>
                <strong>Safari</strong>: 환경설정 → 웹사이트 → 팝업 창
              </div>
            </AlertDescription>
          </Alert>
        </div>
      </DialogContent>
    </Dialog>
  );
}
