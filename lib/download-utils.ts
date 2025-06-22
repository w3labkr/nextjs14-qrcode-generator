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

// SVG를 Canvas로 변환하는 함수
const convertSvgToCanvas = async (
  svgDataUrl: string,
  qrWidth: number,
  qrHeight: number,
  backgroundColor: string,
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const base64Data = svgDataUrl.split(",")[1];
    const svgContent = atob(base64Data);

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        reject(new Error("Canvas context를 생성할 수 없습니다"));
        return;
      }

      const scale = 4;
      canvas.width = qrWidth * 10 * scale;
      canvas.height = qrHeight * 10 * scale;

      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      const pngDataUrl = canvas.toDataURL("image/png");
      resolve(pngDataUrl);
    };

    img.onerror = () => {
      reject(new Error("SVG 이미지 로드에 실패했습니다"));
    };

    const svgBlob = new Blob([svgContent], { type: "image/svg+xml" });
    const url = URL.createObjectURL(svgBlob);
    img.src = url;

    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 5000);
  });
};

// PDF 문서에 QR 코드 이미지를 추가하는 함수
const addQrCodeToPdf = async (
  doc: any,
  qrSettings: any,
  generateQrCode: any,
  qrWidth: number,
  qrHeight: number,
  xPos: number,
  yPos: number,
) => {
  const svgSettings = { ...qrSettings, type: "svg" as const };
  const svgDataUrl = await generateQrCode(svgSettings);

  try {
    const pngDataUrl = await convertSvgToCanvas(
      svgDataUrl,
      qrWidth,
      qrHeight,
      qrSettings.color?.light || "#ffffff",
    );
    const pngImageData = pngDataUrl.split(",")[1];

    if (pngImageData && pngImageData.length > 0) {
      doc.addImage(pngImageData, "PNG", xPos, yPos, qrWidth, qrHeight);
    } else {
      throw new Error("Canvas 변환에 실패했습니다");
    }
  } catch (error) {
    console.warn("SVG Canvas 변환 실패, PNG로 대체:", error);
    const pngSettings = { ...qrSettings, type: "png" as const };
    const pngDataUrl = await generateQrCode(pngSettings);
    const pngImageData = pngDataUrl.split(",")[1];

    if (pngImageData && pngImageData.length > 0) {
      doc.addImage(pngImageData, "PNG", xPos, yPos, qrWidth, qrHeight);
    } else {
      throw new Error("PDF에 QR 코드 이미지를 추가할 수 없습니다");
    }
  }
};

// PDF로 다운로드하는 함수
const downloadAsPdf = async (
  qrSettings: any,
  generateQrCode: any,
  title: string | null | undefined,
  type: string,
) => {
  const { jsPDF } = await import("jspdf");

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const qrWidth = 100;
  const qrHeight = 100;
  const xPos = (pageWidth - qrWidth) / 2;
  const yPos = (pageHeight - qrHeight) / 2;

  doc.setFontSize(16);
  doc.text("QR 코드", pageWidth / 2, 20, { align: "center" });

  await addQrCodeToPdf(
    doc,
    qrSettings,
    generateQrCode,
    qrWidth,
    qrHeight,
    xPos,
    yPos,
  );

  const now = new Date();
  const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  doc.setFontSize(10);
  doc.text(`생성일: ${dateStr}`, pageWidth / 2, pageHeight - 20, {
    align: "center",
  });

  const filename = generateFileName(title, type, "pdf");
  const pdfBlob = doc.output("blob");
  downloadFile(pdfBlob, filename);
};

// SVG로 다운로드하는 함수
const downloadAsSvg = async (qrCodeDataUrl: string, filename: string) => {
  const base64Data = qrCodeDataUrl.split(",")[1];
  const svgContent = atob(base64Data);
  const blob = new Blob([svgContent], { type: "image/svg+xml" });
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

    if (format === "pdf") {
      await downloadAsPdf(qrSettings, generateQrCode, title, type);
      return { success: true };
    }

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
