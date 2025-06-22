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
  onGenerate: () => void;
  onGenerateHighRes: () => void;
  isLoading: boolean;
  isGeneratingHighRes: boolean;
  isEditMode: boolean;
  qrData: string;
  highResQrCode: string;
  getDownloadFilename: () => string;
  getHighResDownloadFilename: () => string;
  currentSettings: any; // 현재 QR 코드 설정값
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
  currentSettings,
}: QrCodePreviewCardProps) {
  const { data: session } = useSession();
  const isOnline = useOnlineStatus();

  const handleDownload = async () => {
    if (!qrCode || !qrData) return;

    const filename = getDownloadFilename();

    try {
      // 현재 표시되고 있는 QR 코드의 형식과 다운로드하려는 형식이 다르면 새로 생성
      const currentFormat = qrCode.includes("data:image/svg+xml")
        ? "svg"
        : qrCode.includes("data:image/jpeg")
          ? "jpeg"
          : qrCode.includes("data:application/pdf")
            ? "pdf"
            : "png";

      let downloadUrl = qrCode;

      if (currentFormat !== format) {
        // 새로운 형식으로 QR 코드 재생성
        const { generateQrCode } = await import(
          "@/app/actions/qr-code-generator"
        );

        // 현재 설정값으로 새 QR 코드 생성
        const settings = {
          text: qrData,
          type: format as any,
          width: 400, // 기본 다운로드 해상도
          color: {
            dark: currentSettings?.color?.dark || "#000000",
            light: currentSettings?.color?.light || "#ffffff",
          },
          logo: currentSettings?.logo,
          dotsOptions: currentSettings?.dotsOptions,
          cornersSquareOptions: currentSettings?.cornersSquareOptions,
          frameOptions: currentSettings?.frameOptions,
        };

        downloadUrl = await generateQrCode(settings);
      }

      if (format === "svg") {
        // Base64로 인코딩된 SVG 디코딩
        const base64Data = downloadUrl.split(",")[1];
        const svgContent = atob(base64Data);
        const blob = new Blob([svgContent], { type: "image/svg+xml" });

        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } else {
        // 다른 형식의 경우 기존 방식 사용
        const link = document.createElement("a");
        link.href = downloadUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (error) {
      console.error("다운로드 오류:", error);
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
          <Button
            disabled={!qrCode}
            className="w-full"
            onClick={() => handleDownload()}
          >
            다운로드
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
