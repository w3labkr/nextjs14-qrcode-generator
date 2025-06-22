"use client";

import { useState, useEffect } from "react";
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
import {
  generateQrCode,
  generateAndSaveQrCode,
  generateHighResQrCode,
} from "@/app/actions/qr-code";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UrlForm } from "@/components/qr-code-forms/url-form";
import { TextForm } from "@/components/qr-code-forms/text-form";
import { WifiForm } from "@/components/qr-code-forms/wifi-form";
import { EmailForm } from "@/components/qr-code-forms/email-form";
import { SmsForm } from "@/components/qr-code-forms/sms-form";
import { VCardForm } from "@/components/qr-code-forms/vcard-form";
import { LocationForm } from "@/components/qr-code-forms/location-form";
import { QrCodeFramesSelector } from "@/components/qr-code-frames/index";
import { QrCodePreviewWithFrame } from "@/components/qr-code-preview-with-frame";
import {
  FrameSelector,
  FrameRenderer,
} from "@/components/qr-code-frames/frame-selector";
import usePdfGenerator from "@/hooks/use-pdf-generator";
import { GITHUB_REPO_URL } from "@/lib/constants";
import { GithubBadge } from "@/components/github-badge";
import { UserNav } from "@/components/user-nav";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import TemplateManager from "@/components/template-manager";
import { getDefaultTemplate } from "@/app/actions/qr-code";
import { InstallPromptBanner } from "@/components/install-prompt";
import { OfflineIndicator } from "@/components/offline-indicator";
import { useOnlineStatus } from "@/hooks/use-online-status";

export default function HomePage() {
  const { data: session } = useSession();
  const isOnline = useOnlineStatus();
  const [qrData, setQrData] = useState(GITHUB_REPO_URL);
  const [activeTab, setActiveTab] = useState("url");
  const [qrCode, setQrCode] = useState("");
  const [highResQrCode, setHighResQrCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingHighRes, setIsGeneratingHighRes] = useState(false);

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

  // 로그인 시 기본 템플릿 로드
  useEffect(() => {
    const loadDefaultTemplate = async () => {
      if (session?.user) {
        try {
          const defaultTemplate = await getDefaultTemplate();
          if (defaultTemplate) {
            const settings = JSON.parse(defaultTemplate.settings);
            handleLoadTemplate(settings);
            toast.success(
              `기본 템플릿 "${defaultTemplate.name}"이 적용되었습니다.`,
            );
          }
        } catch (error) {
          console.error("기본 템플릿 로드 오류:", error);
        }
      }
    };

    loadDefaultTemplate();
  }, [session?.user]);

  // 로컬 스토리지에서 템플릿 설정 읽기
  useEffect(() => {
    const savedSettings = localStorage.getItem("qr-template-settings");
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings);
        handleLoadTemplate(settings);
        localStorage.removeItem("qr-template-settings"); // 한 번 사용 후 삭제
        toast.success("템플릿이 적용되었습니다!");
      } catch (error) {
        console.error("템플릿 설정 로드 오류:", error);
      }
    }
  }, []);

  // 템플릿 적용 함수
  const handleLoadTemplate = (
    settings: import("@/app/actions/qr-code").QrCodeOptions,
  ) => {
    if (settings.color?.dark) setForegroundColor(settings.color.dark);
    if (settings.color?.light) setBackgroundColor(settings.color.light);
    if (settings.logo) setLogo(settings.logo);
    if (settings.width) setWidth(settings.width);
    if (settings.frameOptions && settings.frameOptions.type) {
      setFrameOptions({
        type: settings.frameOptions.type as any,
        text: settings.frameOptions.text || "스캔해 주세요",
        textColor: settings.frameOptions.textColor || "#000000",
        borderColor: settings.frameOptions.borderColor || "#000000",
        backgroundColor: settings.frameOptions.backgroundColor || "#ffffff",
      });
    }
  };

  // 현재 설정을 QrCodeOptions 형태로 반환
  const getCurrentSettings =
    (): import("@/app/actions/qr-code").QrCodeOptions => ({
      text: qrData,
      color: {
        dark: foregroundColor,
        light: backgroundColor,
      },
      logo: logo || undefined,
      width,
      frameOptions: frameOptions.type !== "none" ? frameOptions : undefined,
    });

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
      // QR 코드 유형 결정
      let qrType:
        | "URL"
        | "TEXT"
        | "WIFI"
        | "EMAIL"
        | "SMS"
        | "VCARD"
        | "LOCATION" = "TEXT";
      if (activeTab === "url") qrType = "URL";
      else if (activeTab === "wifi") qrType = "WIFI";
      else if (activeTab === "email") qrType = "EMAIL";
      else if (activeTab === "sms") qrType = "SMS";
      else if (activeTab === "vcard") qrType = "VCARD";
      else if (activeTab === "location") qrType = "LOCATION";
      else if (activeTab === "text") qrType = "TEXT";

      // 로그인한 사용자의 경우 저장과 함께 생성
      if (session?.user) {
        const result = await generateAndSaveQrCode({
          text: qrData,
          type: format === "pdf" ? "png" : format,
          width: width,
          color: {
            dark: foregroundColor,
            light: backgroundColor,
          },
          logo: logo || undefined,
          frameOptions: frameOptions.type !== "none" ? frameOptions : undefined,
          qrType,
          title: `${qrType} QR 코드 - ${new Date().toLocaleDateString("ko-KR")}`,
        });

        // PDF 변환이 필요한 경우
        if (format === "pdf") {
          const pdfDataUrl = await generatePdf({
            qrCodeUrl: result.qrCodeDataUrl,
            qrText: qrData,
            frameOptions:
              frameOptions.type !== "none" ? frameOptions : undefined,
          });
          setQrCode(pdfDataUrl);
        } else {
          setQrCode(result.qrCodeDataUrl);
        }

        if (result.savedId) {
          toast.success("QR 코드가 생성되고 히스토리에 저장되었습니다!");
        }
      } else {
        // 비로그인 사용자는 기존 방식으로 생성
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

          const pdfDataUrl = await generatePdf({
            qrCodeUrl: pngDataUrl,
            qrText: qrData,
            frameOptions:
              frameOptions.type !== "none" ? frameOptions : undefined,
          });

          setQrCode(pdfDataUrl);
        } else {
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
          setQrCode(qrCodeDataUrl);
        }
      }
    } catch (error) {
      console.error(error);
      toast.error("QR 코드 생성에 실패했습니다.");
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
    // 탭 변경 시 입력 데이터와 고해상도 QR 코드 초기화
    setHighResQrCode("");
    if (value === "url") {
      setQrData(GITHUB_REPO_URL);
    } else {
      setQrData("");
    }
  };

  // 고해상도 QR 코드 생성 (로그인 사용자 전용)
  const handleGenerateHighRes = async () => {
    if (!qrData || !session?.user) return;

    setIsGeneratingHighRes(true);
    try {
      const highResOptions = {
        text: qrData,
        type: format === "pdf" ? "png" : format,
        width: 4096, // 4K resolution
        color: {
          dark: foregroundColor,
          light: backgroundColor,
        },
        logo: logo || undefined,
        frameOptions: frameOptions.type !== "none" ? frameOptions : undefined,
      };

      // @ts-ignore
      const highResDataUrl = await generateHighResQrCode(highResOptions);
      setHighResQrCode(highResDataUrl);
      toast.success("고해상도 QR 코드가 생성되었습니다! (4096x4096)");
    } catch (error) {
      console.error("고해상도 QR 코드 생성 오류:", error);
      toast.error("고해상도 QR 코드 생성에 실패했습니다.");
    } finally {
      setIsGeneratingHighRes(false);
    }
  };

  const getHighResDownloadFilename = () => {
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, "-");
    return `qrcode-4k-${timestamp}.${format === "pdf" ? "png" : format}`;
  };

  // 계정 삭제 성공 메시지 표시
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("deleted") === "true") {
      toast.success(
        "계정이 성공적으로 삭제되었습니다. 모든 데이터가 완전히 제거되었습니다.",
      );
      // URL에서 파라미터 제거
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  return (
    <main className="flex min-h-screen flex-col p-4 sm:p-8 md:p-24">
      {/* 상단 네비게이션 */}
      <div className="w-full max-w-4xl mx-auto mb-8">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold">QR 코드 생성기</h1>
          </div>
          <UserNav />
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center">
        <GithubBadge />
        <div className="z-10 w-full max-w-4xl items-start justify-between font-mono text-sm lg:flex gap-8">
          <div className="flex flex-col gap-4 flex-1">
            <h2 className="text-4xl font-bold">오픈소스 QR 코드 생성기</h2>
            <p className="text-muted-foreground">
              URL, 텍스트, Wi-Fi 등 원하는 콘텐츠를 QR 코드로 즉시 만들어보세요.
              다양한 옵션으로 자유롭게 커스터마이징할 수 있습니다.
            </p>

            {/* PWA 관련 알림들 */}
            <OfflineIndicator />
            <InstallPromptBanner />

            <Tabs
              defaultValue="url"
              className="w-full"
              onValueChange={handleTabChange}
            >
              <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-1">
                <TabsTrigger value="url">URL</TabsTrigger>
                <TabsTrigger value="text">텍스트</TabsTrigger>
                <TabsTrigger value="wifi">Wi-Fi</TabsTrigger>
                <TabsTrigger value="email">이메일</TabsTrigger>
                <TabsTrigger value="sms">SMS</TabsTrigger>
                <TabsTrigger value="vcard">연락처</TabsTrigger>
                <TabsTrigger value="location">위치</TabsTrigger>
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
              <TabsContent value="email">
                <EmailForm onChange={setQrData} />
              </TabsContent>
              <TabsContent value="sms">
                <SmsForm onChange={setQrData} />
              </TabsContent>
              <TabsContent value="vcard">
                <VCardForm onChange={setQrData} />
              </TabsContent>
              <TabsContent value="location">
                <LocationForm onChange={setQrData} />
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

            {/* 로그인 사용자에게만 템플릿 관리 기능 표시 */}
            {session?.user && (
              <TemplateManager
                currentSettings={getCurrentSettings()}
                onLoadTemplate={handleLoadTemplate}
              />
            )}
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
                      handleFormatChange(
                        value as "png" | "svg" | "jpeg" | "pdf",
                      )
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
                        onClick={handleGenerateHighRes}
                        disabled={isGeneratingHighRes || !qrData}
                        variant="outline"
                        className="flex-1"
                      >
                        {isGeneratingHighRes
                          ? "생성 중..."
                          : "4K 고해상도 생성"}
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
                      4096x4096 픽셀의 초고해상도 QR 코드를 다운로드할 수
                      있습니다. 인쇄나 대형 디스플레이에 최적화되어 있습니다.
                    </p>
                  </div>
                )}
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
      <footer className="w-full mt-12 flex justify-center text-xs text-muted-foreground">
        © 2025 W3LabKr. All rights reserved.
      </footer>
    </main>
  );
}
