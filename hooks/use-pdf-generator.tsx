"use client";

import { useState, useCallback, useMemo } from "react";
import { jsPDF } from "jspdf";

import { FrameOptions as QrFrameOptions } from "@/components/qr-code-frames";
import { GITHUB_REPO_URL } from "@/lib/constants";

interface PdfGeneratorProps {
  qrCodeUrl: string;
  qrText: string;
  frameOptions?: QrFrameOptions;
  qrSettings?: any; // QR 코드 생성 설정
}

interface PdfConfig {
  orientation: "portrait" | "landscape";
  unit: "mm" | "pt" | "in" | "px";
  format: string | number[];
}

interface PdfColors {
  black: [number, number, number];
  gray: [number, number, number];
  lightGray: [number, number, number];
}

interface PdfDimensions {
  pageWidth: number;
  pageHeight: number;
  qrWidth: number;
  qrHeight: number;
  xPos: number;
  yPos: number;
}

const PDF_CONFIG: PdfConfig = {
  orientation: "portrait",
  unit: "mm",
  format: "a4",
};

const PDF_COLORS: PdfColors = {
  black: [0, 0, 0],
  gray: [80, 80, 80],
  lightGray: [100, 100, 100],
};

const QR_CODE_SIZE = 100;
const QR_CODE_Y_POSITION = 70;
const TEXT_MAX_LENGTH = 50;
const TRUNCATE_SUFFIX = "...";

export default function usePdfGenerator() {
  const [isGenerating, setIsGenerating] = useState(false);

  const pdfConfig = useMemo(() => PDF_CONFIG, []);

  const setupFont = useCallback(async (doc: jsPDF): Promise<void> => {
    try {
      const font = await fetch("/fonts/NanumGothic-Regular.ttf").then((res) =>
        res.arrayBuffer(),
      );
      const fontBase64 = btoa(
        new Uint8Array(font).reduce(
          (data, byte) => data + String.fromCharCode(byte),
          "",
        ),
      );
      doc.addFileToVFS("NanumGothic-Regular.ttf", fontBase64);
      doc.addFont("NanumGothic-Regular.ttf", "NanumGothic", "normal");
      doc.setFont("NanumGothic");
    } catch (error) {
      console.warn("폰트 로드 실패, 기본 폰트 사용:", error);
    }
  }, []);

  const calculateDimensions = useCallback((doc: jsPDF): PdfDimensions => {
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const qrWidth = QR_CODE_SIZE;
    const qrHeight = QR_CODE_SIZE;
    const xPos = (pageWidth - qrWidth) / 2;
    const yPos = QR_CODE_Y_POSITION;

    return { pageWidth, pageHeight, qrWidth, qrHeight, xPos, yPos };
  }, []);

  const addTitle = useCallback((doc: jsPDF, pageWidth: number): void => {
    doc.setFontSize(24);
    doc.setTextColor(...PDF_COLORS.black);
    doc.text("QR 코드", pageWidth / 2, 20, { align: "center" });
  }, []);

  const addMetadata = useCallback((doc: jsPDF, qrText: string): void => {
    doc.setFontSize(12);
    doc.setTextColor(...PDF_COLORS.gray);

    const displayText = truncateText(qrText, TEXT_MAX_LENGTH);
    doc.text(`내용: ${displayText}`, 20, 40);

    const dateStr = formatCurrentDate();
    doc.text(`생성일: ${dateStr}`, 20, 50);
  }, []);

  const getImageType = useCallback((qrCodeUrl: string): string => {
    if (qrCodeUrl.includes("image/svg")) return "SVG";
    if (qrCodeUrl.includes("image/jpeg")) return "JPEG";
    return "PNG";
  }, []);

  const addQrCode = useCallback(
    async (
      doc: jsPDF,
      qrCodeUrl: string,
      qrText: string,
      qrSettings: any,
      dimensions: PdfDimensions,
    ): Promise<void> => {
      try {
        let imageData: string;
        let imageType: string;

        // SVG인 경우 PNG로 변환해서 사용
        if (qrCodeUrl.includes("image/svg")) {
          const { generateQrCode } = await import(
            "@/app/actions/qr-code-generator"
          );

          // 현재 설정으로 PNG QR 코드 생성
          const pngDataUrl = await generateQrCode({
            text: qrText,
            type: "png",
            width: 800,
            margin: qrSettings?.margin || 0,
            color: qrSettings?.color || {
              dark: "#000000",
              light: "#ffffff",
            },
            logo: qrSettings?.logo,
            dotsOptions: qrSettings?.dotsOptions,
            cornersSquareOptions: qrSettings?.cornersSquareOptions,
          });

          imageData = pngDataUrl.split(",")[1];
          imageType = "PNG";
        } else {
          // PNG, JPEG 등 다른 형식은 그대로 사용
          imageData = qrCodeUrl.split(",")[1];
          imageType = getImageType(qrCodeUrl);
        }

        if (!imageData) {
          throw new Error("유효하지 않은 QR 코드 이미지 데이터");
        }

        doc.addImage(
          imageData,
          imageType,
          dimensions.xPos,
          dimensions.yPos,
          dimensions.qrWidth,
          dimensions.qrHeight,
        );
      } catch (error) {
        console.error("QR 코드 이미지 추가 실패:", error);
        throw new Error("QR 코드 이미지를 PDF에 추가할 수 없습니다");
      }
    },
    [getImageType],
  );

  const addFrameText = useCallback(
    (
      doc: jsPDF,
      frameOptions: QrFrameOptions | undefined,
      dimensions: PdfDimensions,
    ): void => {
      if (!frameOptions || frameOptions.type === "none") return;

      doc.setFontSize(16);
      const textColor = hexToRgb(frameOptions.textColor || "#000000");

      if (textColor) {
        doc.setTextColor(textColor.r, textColor.g, textColor.b);
      } else {
        doc.setTextColor(...PDF_COLORS.black);
      }

      doc.text(
        frameOptions.text || "스캔해 주세요",
        dimensions.pageWidth / 2,
        dimensions.yPos + dimensions.qrHeight + 20,
        { align: "center" },
      );
    },
    [],
  );

  const addFooter = useCallback(
    (doc: jsPDF, pageWidth: number, pageHeight: number): void => {
      doc.setFontSize(10);
      doc.setTextColor(...PDF_COLORS.lightGray);
      doc.text(
        `오픈소스 QR 코드 생성기 - ${GITHUB_REPO_URL}`,
        pageWidth / 2,
        pageHeight - 10,
        { align: "center" },
      );
    },
    [],
  );

  const generatePdf = useCallback(
    async ({
      qrCodeUrl,
      qrText,
      frameOptions,
      qrSettings,
    }: PdfGeneratorProps): Promise<string> => {
      if (!qrCodeUrl) return "";

      setIsGenerating(true);

      try {
        const doc = new jsPDF(pdfConfig);

        await setupFont(doc);

        const dimensions = calculateDimensions(doc);

        addTitle(doc, dimensions.pageWidth);
        addMetadata(doc, qrText);
        await addQrCode(doc, qrCodeUrl, qrText, qrSettings, dimensions);
        addFrameText(doc, frameOptions, dimensions);
        addFooter(doc, dimensions.pageWidth, dimensions.pageHeight);

        return doc.output("datauristring");
      } catch (error) {
        console.error("PDF 생성 중 오류 발생:", error);
        throw new Error("PDF 생성에 실패했습니다.");
      } finally {
        setIsGenerating(false);
      }
    },
    [
      pdfConfig,
      setupFont,
      calculateDimensions,
      addTitle,
      addMetadata,
      addQrCode,
      addFrameText,
      addFooter,
    ],
  );

  return { generatePdf, isGenerating };
}

function truncateText(text: string, maxLength: number): string {
  return text.length > maxLength
    ? text.substring(0, maxLength - TRUNCATE_SUFFIX.length) + TRUNCATE_SUFFIX
    : text;
}

function formatCurrentDate(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}
