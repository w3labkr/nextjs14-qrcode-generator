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
import { downloadQrCode } from "@/lib/qr-download-utils";
import type { QrCodePreviewCardProps } from "@/types/qr-code";

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
  currentSettings,
}: QrCodePreviewCardProps) {
  const { data: session } = useSession();
  const isLoggedIn = !!session?.user;

  const handleDownload = async () => {
    if (!qrCode || !qrData) return;

    const filename = getDownloadFilename();

    try {
      await downloadQrCode(qrCode, format, filename, qrData, currentSettings);
    } catch (error) {
      console.error("다운로드 오류:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "알 수 없는 오류가 발생했습니다.";
      alert(
        `다운로드 중 오류가 발생했습니다: ${errorMessage}\n\n다른 브라우저를 시도하거나 잠시 후 다시 시도해주세요.`,
      );
    }
  };

  const handleHighResDownload = () => {
    if (!highResQrCode) return;

    const filename = getHighResDownloadFilename();
    const link = document.createElement("a");
    link.href = highResQrCode;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
          onClick={() => onGenerate()}
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

        <div className="flex gap-2 w-full">
          <Select
            value={format}
            onValueChange={(value) =>
              onFormatChange(value as "png" | "svg" | "jpg")
            }
            disabled={!qrCode || isLoading}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="포맷 선택" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="png">PNG (기본 해상도)</SelectItem>
              <SelectItem value="svg">SVG (벡터)</SelectItem>
              <SelectItem value="jpg">JPG (기본 해상도)</SelectItem>
            </SelectContent>
          </Select>
          <Button
            disabled={!qrCode}
            className="w-full"
            onClick={handleDownload}
          >
            다운로드
          </Button>
        </div>

        {/* 로그인 사용자 전용 고해상도 다운로드 */}
        {isLoggedIn && qrCode && (
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
                <Button className="flex-1" onClick={handleHighResDownload}>
                  4K 다운로드
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
