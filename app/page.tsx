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
import Image from "next/image";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UrlForm } from "@/components/qr-code-forms/url-form";
import { TextForm } from "@/components/qr-code-forms/text-form";
import { WifiForm } from "@/components/qr-code-forms/wifi-form";

export default function HomePage() {
  const [qrData, setQrData] = useState(
    "https://github.com/w3labkr/nextjs14-supabase-qrcode",
  );
  const [activeTab, setActiveTab] = useState("url");
  const [qrCode, setQrCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Customization State
  const [foregroundColor, setForegroundColor] = useState("#000000");
  const [backgroundColor, setBackgroundColor] = useState("#ffffff");
  const [logo, setLogo] = useState<string | null>(null);
  const [format, setFormat] = useState<"png" | "svg" | "jpeg">("png");
  const [width, setWidth] = useState(400);

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
      const options = {
        type: format,
        width: width,
        color: {
          dark: foregroundColor,
          light: backgroundColor,
        },
        logo: logo || undefined,
      };
      // @ts-ignore
      const qrCodeDataUrl = await generateQrCode(qrData, options);
      setQrCode(qrCodeDataUrl as string);
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

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    // 탭 변경 시 입력 데이터 초기화
    if (value === "url") {
      setQrData("https://github.com/w3labkr/nextjs14-supabase-qrcode");
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
        </div>

        <div className="flex-1 mt-8 lg:mt-0">
          <Card className="w-full sticky top-8">
            <CardHeader>
              <CardTitle>QR 코드 미리보기</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center gap-4 min-h-[300px]">
              {qrCode ? (
                <Image
                  src={qrCode}
                  alt="Generated QR Code"
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
                    setFormat(value as "png" | "svg" | "jpeg")
                  }
                  disabled={!qrCode}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="포맷 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="png">PNG</SelectItem>
                    <SelectItem value="svg">SVG</SelectItem>
                    <SelectItem value="jpeg">JPG</SelectItem>
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
