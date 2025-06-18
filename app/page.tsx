"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
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
import { Label } from "@/components/ui/label";
import { generateQrCode } from "@/app/actions/qr-code";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UrlForm } from "@/components/qr-code-forms/url-form";
import { TextForm } from "@/components/qr-code-forms/text-form";
import { WifiForm } from "@/components/qr-code-forms/wifi-form";
import { QrCodeFramesSelector } from "@/components/qr-code-frames/index";
import { QrCodePreviewWithFrame } from "@/components/qr-code-preview-with-frame";
import {
  FrameSelector,
  FrameRenderer,
} from "@/components/qr-code-frames/frame-selector";
import usePdfGenerator from "@/hooks/use-pdf-generator";

export default function HomePage() {
  const [qrData, setQrData] = useState(
    "https://github.com/w3labkr/nextjs14-qrcode",
  );
  const [activeTab, setActiveTab] = useState("url");
  const [qrCode, setQrCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Customization State
  const [foregroundColor, setForegroundColor] = useState("#000000");
  const [backgroundColor, setBackgroundColor] = useState("#ffffff");
  const [logo, setLogo] = useState<string | null>(null);
  const [format, setFormat] = useState<"png" | "svg" | "jpeg" | "pdf">("png");
  const [width, setWidth] = useState(400);
  const [frameOptions, setFrameOptions] = useState<
    import("@/components/qr-code-frames").FrameOptions
  >({
    type: "none",
    text: "스캔해 주세요",
    textColor: "#000000",
    borderColor: "#000000",
    backgroundColor: "#ffffff",
  });

  // PDF 생성 기능 추가
  const { generatePdf, isGenerating: isPdfGenerating } = usePdfGenerator();

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogo(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!qrData) return;

    setIsLoading(true);
    try {
      // PDF 형식인 경우 먼저 PNG로 QR 코드를 생성한 후, PDF로 변환
      if (format === "pdf") {
        const pngOptions = {
          text: qrData,
          type: "png" as const,
          width: width,
          color: {
            dark: foregroundColor,
            light: backgroundColor,
          },
          logo: logo || undefined,
        };

        // @ts-ignore
        const pngDataUrl = await generateQrCode(pngOptions);

        // PNG QR 코드가 생성되면 PDF로 변환
        const pdfDataUrl = await generatePdf({
          qrCodeUrl: pngDataUrl,
          qrText: qrData,
          frameOptions: frameOptions.type !== "none" ? frameOptions : undefined,
        });

        setQrCode(pdfDataUrl);
      } else {
        // 일반적인 이미지 형식의 QR 코드 생성
        const options = {
          text: qrData,
          type: format,
          width: width,
          color: {
            dark: foregroundColor,
            light: backgroundColor,
          },
          logo: logo || undefined,
        };

        // @ts-ignore
        const qrCodeDataUrl = await generateQrCode(options);

        // 프레임 적용 (현재는 PDF에서만 프레임을 적용하지만,
        // 향후 canvas나 SVG를 사용하여 이미지 레벨에서 프레임을 적용할 수 있음)
        setQrCode(qrCodeDataUrl);
      }
    } catch (error) {
      console.error(error);
      // TODO: 사용자에게 에러 메시지 표시
    } finally {
      setIsLoading(false);
    }
  };

  const getDownloadFilename = () => {
    return `qrcode.${format}`;
  };

  const handleFormatChange = async (
    newFormat: "png" | "svg" | "jpeg" | "pdf",
  ) => {
    setFormat(newFormat);

    // 이미 생성된 QR 코드가 있고 PDF로 변환하는 경우
    if (
      qrCode &&
      newFormat === "pdf" &&
      qrCode.indexOf("data:application/pdf") === -1
    ) {
      setIsLoading(true);
      try {
        const pdfDataUrl = await generatePdf({
          qrCodeUrl: qrCode,
          qrText: qrData,
          frameOptions: frameOptions.type !== "none" ? frameOptions : undefined,
        });
        setQrCode(pdfDataUrl);
      } catch (error) {
        console.error("PDF 변환 오류:", error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    // 탭 변경 시 입력 데이터 초기화
    if (value === "url") {
      setQrData("https://github.com/w3labkr/nextjs14-qrcode");
    } else {
      setQrData("");
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-8 md:p-24">
      <div className="z-10 w-full max-w-4xl items-start justify-between font-mono text-sm lg:flex gap-8">
        <div className="flex flex-col gap-4 flex-1">
          <h1 className="text-4xl font-bold">오픈소스 QR 코드 생성기</h1>
          <p className="text-muted-foreground">
            URL, 텍스트, Wi-Fi 등 원하는 콘텐츠를 QR 코드로 즉시 만들어보세요.
            다양한 옵션으로 자유롭게 커스터마이징할 수 있습니다.
          </p>
          <Tabs
            defaultValue="url"
            className="w-full"
            onValueChange={handleTabChange}
          >
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="url">URL</TabsTrigger>
              <TabsTrigger value="text">텍스트</TabsTrigger>
              <TabsTrigger value="wifi">Wi-Fi</TabsTrigger>
            </TabsList>
            <TabsContent value="url">
              <UrlForm value={qrData} onChange={setQrData} />
            </TabsContent>
            <TabsContent value="text">
              <TextForm value={qrData} onChange={setQrData} />
            </TabsContent>
            <TabsContent value="wifi">
              <WifiForm onWifiDataChange={setQrData} />
            </TabsContent>
          </Tabs>

          <Card>
            <CardHeader>
              <CardTitle>디자인</CardTitle>
              <CardDescription>
                QR 코드의 색상과 로고를 설정하세요.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="foreground-color">전경색</Label>
                <Input
                  id="foreground-color"
                  type="color"
                  value={foregroundColor}
                  onChange={(e) => setForegroundColor(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="background-color">배경색</Label>
                <Input
                  id="background-color"
                  type="color"
                  value={backgroundColor}
                  onChange={(e) => setBackgroundColor(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-2 sm:col-span-2">
                <Label htmlFor="logo-upload">로고 (선택 사항)</Label>
                <Input
                  id="logo-upload"
                  type="file"
                  accept="image/png, image/jpeg, image/svg+xml"
                  onChange={handleLogoUpload}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>프레임 추가</CardTitle>
              <CardDescription>
                QR 코드에 안내 문구와 프레임을 추가해 스캔율을 높이세요.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <QrCodeFramesSelector
                value={frameOptions}
                onChange={setFrameOptions}
              />
            </CardContent>
          </Card>
        </div>

        <div className="flex-1 mt-8 lg:mt-0">
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
                  <p className="text-muted-foreground">
                    생성 버튼을 눌러주세요
                  </p>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button
                onClick={handleGenerate}
                disabled={isLoading || !qrData}
                className="w-full"
              >
                {isLoading ? "생성 중..." : "QR 코드 생성"}
              </Button>
              <div className="flex gap-2 w-full">
                <Select
                  value={format}
                  onValueChange={(value) =>
                    handleFormatChange(value as "png" | "svg" | "jpeg" | "pdf")
                  }
                  disabled={!qrCode || isLoading}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="포맷 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="png">PNG</SelectItem>
                    <SelectItem value="svg">SVG</SelectItem>
                    <SelectItem value="jpeg">JPG</SelectItem>
                    <SelectItem value="pdf">PDF</SelectItem>
                  </SelectContent>
                </Select>
                <Button asChild disabled={!qrCode} className="w-full">
                  <a href={qrCode} download={getDownloadFilename()}>
                    다운로드
                  </a>
                </Button>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </main>
  );
}
