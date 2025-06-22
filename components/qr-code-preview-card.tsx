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

// SVG를 Canvas를 통해 PNG로 변환하는 함수
const convertSvgToPng = async (
  svgDataUrl: string,
  width: number = 1024,
): Promise<string> => {
  return new Promise((resolve, reject) => {
    try {
      let svgContent: string;

      // SVG 데이터 URL에서 콘텐츠 추출
      if (svgDataUrl.startsWith("data:image/svg+xml;base64,")) {
        // Base64로 인코딩된 경우
        try {
          const base64Data = svgDataUrl.split(",")[1];
          if (!base64Data) {
            reject(new Error("Base64 데이터가 없습니다."));
            return;
          }
          svgContent = atob(base64Data);
        } catch (error) {
          reject(new Error("Base64 디코딩에 실패했습니다."));
          return;
        }
      } else if (svgDataUrl.startsWith("data:image/svg+xml;charset=utf-8,")) {
        // UTF-8 인코딩된 경우
        try {
          svgContent = decodeURIComponent(svgDataUrl.split(",")[1]);
        } catch (error) {
          reject(new Error("UTF-8 디코딩에 실패했습니다."));
          return;
        }
      } else if (svgDataUrl.startsWith("data:image/svg+xml,")) {
        // URL 인코딩된 경우
        try {
          svgContent = decodeURIComponent(svgDataUrl.split(",")[1]);
        } catch (error) {
          reject(new Error("URL 디코딩에 실패했습니다."));
          return;
        }
      } else if (svgDataUrl.startsWith("<svg")) {
        // 직접 SVG 문자열인 경우
        svgContent = svgDataUrl;
      } else {
        console.error(
          "지원하지 않는 SVG 데이터 형식:",
          svgDataUrl.substring(0, 100),
        );
        reject(
          new Error(
            `지원하지 않는 SVG 데이터 형식입니다. 형식: ${svgDataUrl.substring(0, 50)}...`,
          ),
        );
        return;
      }

      // SVG 콘텐츠 검증
      if (!svgContent || typeof svgContent !== "string") {
        reject(new Error("SVG 콘텐츠가 비어있거나 유효하지 않습니다."));
        return;
      }

      if (!svgContent.includes("<svg")) {
        reject(new Error("유효하지 않은 SVG 콘텐츠입니다."));
        return;
      }

      // SVG를 Blob으로 변환하여 안전하게 처리
      const svgBlob = new Blob([svgContent], {
        type: "image/svg+xml;charset=utf-8",
      });
      const svgUrl = URL.createObjectURL(svgBlob);

      // SVG를 이미지로 로드
      const img = new Image();
      img.crossOrigin = "anonymous"; // CORS 문제 방지

      img.onload = () => {
        try {
          // Canvas 생성
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d", { alpha: true });

          if (!ctx) {
            URL.revokeObjectURL(svgUrl);
            reject(new Error("Canvas context를 생성할 수 없습니다."));
            return;
          }

          // Canvas 크기 설정 (정사각형으로 보장)
          const size = Math.max(
            img.naturalWidth || width,
            img.naturalHeight || width,
            width,
          );
          canvas.width = size;
          canvas.height = size;

          // 고품질 렌더링 설정
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = "high";

          // 배경을 투명하게 설정
          ctx.clearRect(0, 0, size, size);

          // 필요한 경우 흰색 배경 설정 (PNG 투명도 지원)
          // ctx.fillStyle = "#ffffff";
          // ctx.fillRect(0, 0, size, size);

          // SVG 이미지를 Canvas 중앙에 그리기
          const drawSize = Math.min(
            size,
            Math.max(img.naturalWidth || width, img.naturalHeight || width),
          );
          const offsetX = (size - drawSize) / 2;
          const offsetY = (size - drawSize) / 2;

          ctx.drawImage(img, offsetX, offsetY, drawSize, drawSize);

          // Canvas를 PNG 데이터 URL로 변환 (최고 품질)
          const pngDataUrl = canvas.toDataURL("image/png", 1.0);

          // 메모리 정리
          URL.revokeObjectURL(svgUrl);
          resolve(pngDataUrl);
        } catch (canvasError) {
          URL.revokeObjectURL(svgUrl);
          console.error("Canvas 처리 오류:", canvasError);
          reject(
            new Error(
              `Canvas 처리 중 오류: ${canvasError instanceof Error ? canvasError.message : String(canvasError)}`,
            ),
          );
        }
      };

      img.onerror = (error) => {
        URL.revokeObjectURL(svgUrl);
        console.error("SVG 이미지 로드 오류:", error);
        console.error("SVG 콘텐츠 미리보기:", svgContent.substring(0, 200));
        reject(
          new Error("SVG 이미지 로드에 실패했습니다. SVG 형식을 확인해주세요."),
        );
      };

      // SVG URL 설정
      img.src = svgUrl;

      // 타임아웃 설정 (15초로 연장)
      setTimeout(() => {
        URL.revokeObjectURL(svgUrl);
        reject(new Error("SVG 로드 시간이 초과되었습니다."));
      }, 15000);
    } catch (error) {
      console.error("SVG 변환 오류:", error);
      reject(
        new Error(
          `SVG 변환 중 오류: ${error instanceof Error ? error.message : String(error)}`,
        ),
      );
    }
  });
};

interface QrCodePreviewCardProps {
  qrCode: string;
  frameOptions: import("@/components/qr-code-frames").FrameOptions;
  format: "png" | "svg" | "jpeg";
  onFormatChange: (format: "png" | "svg" | "jpeg") => void;
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
          width: 1024, // 다운로드 시 고해상도 사용
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

      // SVG에서 PNG로 변환하는 경우 Canvas를 사용하여 고품질 변환
      if (currentFormat === "svg" && format === "png") {
        try {
          const pngDataUrl = await convertSvgToPng(downloadUrl, 1024);
          const link = document.createElement("a");
          link.href = pngDataUrl;
          link.download = filename;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        } catch (svgConvertError) {
          console.warn(
            "SVG to PNG 변환 실패:",
            svgConvertError instanceof Error
              ? svgConvertError.message
              : String(svgConvertError),
          );

          // 사용자에게 알림 (선택사항)
          // alert("SVG 변환 중 문제가 발생했습니다. PNG로 직접 생성합니다.");

          try {
            // SVG 변환 실패 시 PNG로 직접 생성
            const { generateQrCode } = await import(
              "@/app/actions/qr-code-generator"
            );

            const pngSettings = {
              text: qrData,
              type: "png" as any,
              width: 1024,
              color: {
                dark: currentSettings?.color?.dark || "#000000",
                light: currentSettings?.color?.light || "#ffffff",
              },
              logo: currentSettings?.logo,
              dotsOptions: currentSettings?.dotsOptions,
              cornersSquareOptions: currentSettings?.cornersSquareOptions,
              frameOptions: currentSettings?.frameOptions,
            };

            const pngUrl = await generateQrCode(pngSettings);
            const link = document.createElement("a");
            link.href = pngUrl;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          } catch (fallbackError) {
            console.error("PNG 직접 생성도 실패:", fallbackError);
            throw new Error(
              `QR 코드 다운로드에 실패했습니다: ${fallbackError instanceof Error ? fallbackError.message : String(fallbackError)}`,
            );
          }
        }
      } else if (format === "svg") {
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

      // 사용자에게 오류 알림 (브라우저 호환성 문제나 기타 오류)
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
              onFormatChange(value as "png" | "svg" | "jpeg")
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
