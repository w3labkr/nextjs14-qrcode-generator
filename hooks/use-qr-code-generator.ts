"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import {
  generateQrCode,
  generateAndSaveQrCode,
  generateHighResQrCode,
  updateQrCode,
  getDefaultTemplate,
} from "@/app/actions/qr-code";
import usePdfGenerator from "@/hooks/use-pdf-generator";
import { GITHUB_REPO_URL } from "@/lib/constants";

export function useQrCodeGenerator() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();

  const [qrData, setQrData] = useState(GITHUB_REPO_URL);
  const [activeTab, setActiveTab] = useState("url");
  const [qrCode, setQrCode] = useState("");
  const [highResQrCode, setHighResQrCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingHighRes, setIsGeneratingHighRes] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingQrCodeId, setEditingQrCodeId] = useState<string | null>(null);

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

  const { generatePdf } = usePdfGenerator();

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

  // 편집할 QR 코드 데이터 로드
  const loadQrCodeForEdit = async (qrCodeId: string) => {
    try {
      const response = await fetch(`/api/qrcodes/${qrCodeId}`);
      if (response.ok) {
        const qrCodeData = await response.json();

        setQrData(qrCodeData.content);

        if (qrCodeData.settings) {
          const settings =
            typeof qrCodeData.settings === "string"
              ? JSON.parse(qrCodeData.settings)
              : qrCodeData.settings;
          handleLoadTemplate(settings);
        }

        toast.success("편집할 QR 코드를 불러왔습니다.");
      } else {
        toast.error("QR 코드를 불러오는데 실패했습니다.");
      }
    } catch (error) {
      console.error("QR 코드 로드 실패:", error);
      toast.error("QR 코드를 불러오는데 실패했습니다.");
    }
  };

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

      if (session?.user) {
        let result: any = null;

        if (isEditMode && editingQrCodeId) {
          const updateResult = await updateQrCode(editingQrCodeId, {
            text: qrData,
            type: format === "pdf" ? "png" : format,
            width: width,
            color: {
              dark: foregroundColor,
              light: backgroundColor,
            },
            logo: logo || undefined,
            frameOptions:
              frameOptions.type !== "none" ? frameOptions : undefined,
            qrType,
            title: `${qrType} QR 코드 - ${new Date().toLocaleDateString("ko-KR")}`,
          });

          if (updateResult.success) {
            result = {
              qrCodeDataUrl: updateResult.qrCodeDataUrl,
              savedId: editingQrCodeId,
            };
            toast.success("QR 코드가 성공적으로 업데이트되었습니다!");
            setIsEditMode(false);
            setEditingQrCodeId(null);
            window.history.replaceState({}, "", "/");
          } else {
            toast.error(
              updateResult.error || "QR 코드 업데이트에 실패했습니다.",
            );
            return;
          }
        } else {
          result = await generateAndSaveQrCode({
            text: qrData,
            type: format === "pdf" ? "png" : format,
            width: width,
            color: {
              dark: foregroundColor,
              light: backgroundColor,
            },
            logo: logo || undefined,
            frameOptions:
              frameOptions.type !== "none" ? frameOptions : undefined,
            qrType,
            title: `${qrType} QR 코드 - ${new Date().toLocaleDateString("ko-KR")}`,
          });
        }

        if (format === "pdf" && result) {
          const pdfDataUrl = await generatePdf({
            qrCodeUrl: result.qrCodeDataUrl,
            qrText: qrData,
            frameOptions:
              frameOptions.type !== "none" ? frameOptions : undefined,
          });
          setQrCode(pdfDataUrl);
        } else if (result) {
          setQrCode(result.qrCodeDataUrl);
        }

        if (result?.savedId && !isEditMode) {
          toast.success("QR 코드가 생성되고 히스토리에 저장되었습니다!");
        }
      } else {
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

  const handleFormatChange = async (
    newFormat: "png" | "svg" | "jpeg" | "pdf",
  ) => {
    setFormat(newFormat);

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
    setHighResQrCode("");
    if (value === "url") {
      setQrData(GITHUB_REPO_URL);
    } else {
      setQrData("");
    }
  };

  const handleGenerateHighRes = async () => {
    if (!qrData || !session?.user) return;

    setIsGeneratingHighRes(true);
    try {
      const highResOptions = {
        text: qrData,
        type: format === "pdf" ? "png" : format,
        width: 4096,
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

  const getDownloadFilename = () => {
    return `qrcode.${format}`;
  };

  const getHighResDownloadFilename = () => {
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, "-");
    return `qrcode-4k-${timestamp}.${format === "pdf" ? "png" : format}`;
  };

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

  // 편집 모드 처리
  useEffect(() => {
    const editId = searchParams.get("edit");
    const editType = searchParams.get("type");

    if (editId && editType) {
      setIsEditMode(true);
      setEditingQrCodeId(editId);
      setActiveTab(editType);
      loadQrCodeForEdit(editId);
    }
  }, [searchParams]);

  // 로컬 스토리지에서 템플릿 설정 읽기
  useEffect(() => {
    const savedSettings = localStorage.getItem("qr-template-settings");
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings);
        handleLoadTemplate(settings);
        localStorage.removeItem("qr-template-settings");
        toast.success("템플릿이 적용되었습니다!");
      } catch (error) {
        console.error("템플릿 설정 로드 오류:", error);
      }
    }
  }, []);

  // 계정 삭제 성공 메시지 표시
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("deleted") === "true") {
      toast.success(
        "계정이 성공적으로 삭제되었습니다. 모든 데이터가 완전히 제거되었습니다.",
      );
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  return {
    // State
    qrData,
    setQrData,
    activeTab,
    qrCode,
    highResQrCode,
    isLoading,
    isGeneratingHighRes,
    isEditMode,
    foregroundColor,
    setForegroundColor,
    backgroundColor,
    setBackgroundColor,
    logo,
    format,
    width,
    frameOptions,
    setFrameOptions,

    // Handlers
    handleLogoUpload,
    handleGenerate,
    handleFormatChange,
    handleTabChange,
    handleGenerateHighRes,
    handleLoadTemplate,
    getCurrentSettings,
    getDownloadFilename,
    getHighResDownloadFilename,
  };
}
