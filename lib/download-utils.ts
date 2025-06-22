// 설정값을 파싱하고 기본값을 적용하는 함수
const parseQrSettings = (settings: any, content: string, format: string) => {
  let parsedSettings = settings;
  if (typeof settings === "string") {
    try {
      parsedSettings = JSON.parse(settings);
    } catch (e) {
      console.warn("Settings 파싱 오류, 기본값 사용:", e);
      parsedSettings = {};
    }
  }

  return {
    text: content,
    type: format as any,
    width: parsedSettings?.width || 400,
    margin: parsedSettings?.margin || 0,
    color: {
      dark: parsedSettings?.color?.dark || "#000000",
      light: parsedSettings?.color?.light || "#ffffff",
    },
    logo: parsedSettings?.logo || undefined,
    dotsOptions: parsedSettings?.dotsOptions,
    cornersSquareOptions: parsedSettings?.cornersSquareOptions,
    frameOptions: parsedSettings?.frameOptions,
  };
};

// 파일명을 생성하는 함수
const generateFileName = (
  title: string | null | undefined,
  type: string,
  format: string,
): string => {
  const fileExtension = format === "jpeg" ? "jpg" : format;
  const timestamp = new Date().toISOString().slice(0, 10);

  if (title) {
    const sanitizedTitle = title
      .replace(/[^a-zA-Z0-9가-힣\s]/g, "")
      .trim()
      .replace(/\s+/g, "-");
    return `${sanitizedTitle}.${fileExtension}`;
  }

  return `qrcode-${type.toLowerCase()}-${timestamp}.${fileExtension}`;
};

// 브라우저에서 파일을 다운로드하는 함수
const downloadFile = (blob: Blob, filename: string) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

// SVG로 다운로드하는 함수
const downloadAsSvg = async (qrCodeDataUrl: string, filename: string) => {
  const response = await fetch(qrCodeDataUrl);
  const blob = await response.blob();
  downloadFile(blob, filename);
};

// 일반 이미지 형식으로 다운로드하는 함수
const downloadAsImage = async (qrCodeDataUrl: string, filename: string) => {
  const response = await fetch(qrCodeDataUrl);
  const blob = await response.blob();
  downloadFile(blob, filename);
};

// 개발환경에서 디버깅 로그를 출력하는 함수
const logDebugInfo = (format: string, qrSettings: any) => {
  if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
    console.log("Download QR Code - Format:", format, "Settings:", qrSettings);
  }
};

export const downloadQrCode = async (
  content: string,
  type: string,
  settings: any,
  title?: string | null,
  format: string = "png",
) => {
  try {
    const { generateQrCode } = await import("@/app/actions/qr-code-generator");
    const qrSettings = parseQrSettings(settings, content, format);

    logDebugInfo(format, qrSettings);

    const qrCodeDataUrl = await generateQrCode(qrSettings);
    const filename = generateFileName(title, type, format);

    if (format === "svg") {
      await downloadAsSvg(qrCodeDataUrl, filename);
    } else {
      await downloadAsImage(qrCodeDataUrl, filename);
    }

    return { success: true };
  } catch (error) {
    console.error("QR 코드 다운로드 오류:", error);
    return { success: false, error: "다운로드에 실패했습니다." };
  }
};
