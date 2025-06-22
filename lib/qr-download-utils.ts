import { convertSvgToPng, detectQrCodeFormat } from "./svg-converter";
import type { QrCodeFormat, QrCodeGeneratorSettings } from "@/types/qr-code";

/**
 * SVG 파일을 Blob으로 다운로드하는 함수
 */
const downloadSvgAsBlob = (downloadUrl: string, filename: string): void => {
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
};

/**
 * 일반 파일을 다운로드하는 함수
 */
const downloadFile = (downloadUrl: string, filename: string): void => {
  const link = document.createElement("a");
  link.href = downloadUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * 새로운 형식으로 QR 코드를 재생성하는 함수
 */
const regenerateQrCode = async (
  qrData: string,
  format: QrCodeFormat,
  currentSettings: QrCodeGeneratorSettings,
): Promise<string> => {
  const { generateQrCode } = await import("@/app/actions/qr-code-generator");

  const settings: QrCodeGeneratorSettings = {
    text: qrData,
    type: format,
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

  return await generateQrCode(settings);
};

/**
 * SVG에서 PNG로 변환하여 다운로드하는 함수
 */
const downloadSvgAsPng = async (
  downloadUrl: string,
  filename: string,
  qrData: string,
  currentSettings: QrCodeGeneratorSettings,
): Promise<void> => {
  try {
    const pngDataUrl = await convertSvgToPng(downloadUrl, 1024);
    downloadFile(pngDataUrl, filename);
  } catch (svgConvertError) {
    console.warn("SVG to PNG 변환 실패:", svgConvertError);

    // SVG 변환 실패 시 PNG로 직접 생성
    const pngUrl = await regenerateQrCode(qrData, "png", currentSettings);
    downloadFile(pngUrl, filename);
  }
};

/**
 * QR 코드 다운로드를 처리하는 메인 함수
 */
export const downloadQrCode = async (
  qrCode: string,
  format: QrCodeFormat,
  filename: string,
  qrData: string,
  currentSettings: QrCodeGeneratorSettings,
): Promise<void> => {
  const currentFormat = detectQrCodeFormat(qrCode);
  let downloadUrl = qrCode;

  // 현재 형식과 다운로드 형식이 다르면 새로 생성
  if (currentFormat !== format) {
    downloadUrl = await regenerateQrCode(qrData, format, currentSettings);
  }

  // 형식에 따른 다운로드 처리
  if (currentFormat === "svg" && format === "png") {
    await downloadSvgAsPng(downloadUrl, filename, qrData, currentSettings);
  } else if (format === "svg") {
    downloadSvgAsBlob(downloadUrl, filename);
  } else {
    downloadFile(downloadUrl, filename);
  }
};
