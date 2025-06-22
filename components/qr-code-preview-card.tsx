"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { QrCodePreviewWithFrame } from "@/components/qr-code-preview-with-frame";
import { useSession } from "next-auth/react";
import { useOnlineStatus } from "@/hooks/use-online-status";

interface QrCodePreviewCardProps {
  qrCode: string;
  frameOptions: import("@/components/qr-code-frames").FrameOptions;
  format: "png" | "svg" | "jpeg" | "pdf";
  onFormatChange: (format: "png" | "svg" | "jpeg" | "pdf") => void;
  onGenerate: (e: React.MouseEvent<HTMLButtonElement>) => void;
  onGenerateHighRes: () => void;
  isLoading: boolean;
  isGeneratingHighRes: boolean;
  isEditMode: boolean;
  qrData: string;
  highResQrCode: string;
  getDownloadFilename: () => string;
  getHighResDownloadFilename: () => string;
}

export function QrCodePreviewCard({
  qrCode,
  frameOptions,
  format,
  onFormatChange,
  onGenerate,
  onGenerateHighRes,
  isLoading,
  isGeneratingHighRes,
  isEditMode,
  qrData,
  highResQrCode,
  getDownloadFilename,
  getHighResDownloadFilename,
}: QrCodePreviewCardProps) {
  const { data: session } = useSession();
  const isOnline = useOnlineStatus();

  return (
    <Card className="w-full sticky top-8">
      <CardHeader>
        <CardTitle>QR 코드 미리보기</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center gap-4 min-h-[300px]">
        {qrCode ? (
          <QrCodePreviewWithFrame
            qrCodeUrl={qrCode}
            frameOptions={frameOptions}
            width={256}
            height={256}
            className="rounded-lg"
          />
        ) : (
          <div className="w-64 h-64 bg-gray-100 rounded-lg flex items-center justify-center">
            <p className="text-muted-foreground">생성 버튼을 눌러주세요</p>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex flex-col gap-4">
        <Button
          onClick={onGenerate}
          disabled={isLoading || !qrData}
          className="w-full"
        >
          {isLoading
            ? isEditMode
              ? "업데이트 중..."
              : "생성 중..."
            : isEditMode
              ? "QR 코드 업데이트"
              : "QR 코드 생성"}
        </Button>

        {/* 로그인 상태에 따른 안내 */}
        {!session ? (
          <div className="text-sm text-muted-foreground bg-blue-50 p-3 rounded-lg border">
            💡 <strong>로그인하면 더 많은 혜택을!</strong>
            <ul className="mt-2 space-y-1 text-xs">
              <li>• QR 코드 자동 저장 및 히스토리 관리</li>
              <li>• 고해상도 다운로드 (최대 4096x4096)</li>
              <li>• 개인 템플릿 저장</li>
            </ul>
          </div>
        ) : (
          <div className="text-sm text-green-600 bg-green-50 p-3 rounded-lg border border-green-200">
            ✅ 프리미엄 사용자 - 고급 기능 이용 가능
          </div>
        )}

        <div className="flex gap-2 w-full">
          <Select
            value={format}
            onValueChange={(value) =>
              onFormatChange(value as "png" | "svg" | "jpeg" | "pdf")
            }
            disabled={!qrCode || isLoading}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="포맷 선택" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="png">PNG (기본 해상도)</SelectItem>
              <SelectItem value="svg">SVG (벡터)</SelectItem>
              <SelectItem value="jpeg">JPG (기본 해상도)</SelectItem>
              <SelectItem value="pdf">PDF</SelectItem>
            </SelectContent>
          </Select>
          <Button asChild disabled={!qrCode} className="w-full">
            <a href={qrCode} download={getDownloadFilename()}>
              다운로드
            </a>
          </Button>

          {!isOnline && (
            <p className="text-xs text-orange-600 bg-orange-50 p-2 rounded">
              오프라인 상태: 기본 다운로드만 가능합니다
            </p>
          )}
        </div>

        {/* 로그인 사용자 전용 고해상도 다운로드 */}
        {session?.user && qrCode && isOnline && (
          <div className="w-full space-y-2">
            <div className="flex items-center gap-2 text-sm text-green-600">
              <span className="text-lg">✨</span>
              <span className="font-medium">프리미엄 기능</span>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={onGenerateHighRes}
                disabled={isGeneratingHighRes || !qrData}
                variant="outline"
                className="flex-1"
              >
                {isGeneratingHighRes ? "생성 중..." : "4K 고해상도 생성"}
              </Button>
              {highResQrCode && (
                <Button asChild className="flex-1">
                  <a
                    href={highResQrCode}
                    download={getHighResDownloadFilename()}
                  >
                    4K 다운로드
                  </a>
                </Button>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              4096x4096 픽셀의 초고해상도 QR 코드를 다운로드할 수 있습니다.
              인쇄나 대형 디스플레이에 최적화되어 있습니다.
            </p>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
