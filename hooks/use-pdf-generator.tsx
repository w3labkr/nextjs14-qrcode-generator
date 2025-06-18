"use client";

import { useState } from "react";
import { jsPDF } from "jspdf";

import { FrameOptions as QrFrameOptions } from "@/components/qr-code-frames";

interface PdfGeneratorProps {
  qrCodeUrl: string;
  qrText: string;
  frameOptions?: QrFrameOptions;
}

export default function usePdfGenerator() {
  const [isGenerating, setIsGenerating] = useState(false);

  const generatePdf = async ({
    qrCodeUrl,
    qrText,
    frameOptions,
  }: PdfGeneratorProps): Promise<string> => {
    if (!qrCodeUrl) return "";

    setIsGenerating(true);

    try {
      // PDF 문서 생성
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      // 페이지 크기
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      // 제목 추가
      doc.setFontSize(24);
      doc.setTextColor(0, 0, 0);
      doc.text("QR 코드", pageWidth / 2, 20, { align: "center" });

      // QR 코드 정보
      doc.setFontSize(12);
      doc.setTextColor(80, 80, 80);

      // QR 코드에 담긴 데이터 정보 표시
      const displayText =
        qrText.length > 50 ? qrText.substring(0, 47) + "..." : qrText;

      doc.text(`내용: ${displayText}`, 20, 40);

      // 현재 날짜 추가
      const now = new Date();
      const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
      doc.text(`생성일: ${dateStr}`, 20, 50);

      // QR 코드 이미지 추가
      // QR 코드 크기 설정
      const qrWidth = 100; // mm
      const qrHeight = 100; // mm

      // 중앙에 배치
      const xPos = (pageWidth - qrWidth) / 2;
      const yPos = 70; // 상단에서 70mm 위치

      // 이미지를 추가하기 전에 데이터 URL에서 메타데이터 제거
      // 예: 'data:image/png;base64,ABCDE...' => 'ABCDE...'
      let imageType = "PNG";
      if (qrCodeUrl.includes("image/svg")) {
        imageType = "SVG";
      } else if (qrCodeUrl.includes("image/jpeg")) {
        imageType = "JPEG";
      }

      // 이미지 데이터 추출
      const imageData = qrCodeUrl.split(",")[1];

      // 이미지 추가
      doc.addImage(imageData, imageType, xPos, yPos, qrWidth, qrHeight);

      // 프레임 옵션이 있고 타입이 'none'이 아니면 안내 텍스트 추가
      if (frameOptions && frameOptions.type !== "none") {
        doc.setFontSize(16);
        // 색상을 헥사코드에서 RGB로 변환
        const textColor = hexToRgb(frameOptions.textColor || "#000000");
        if (textColor) {
          doc.setTextColor(textColor.r, textColor.g, textColor.b);
        } else {
          doc.setTextColor(0, 0, 0); // 기본 검정
        }

        doc.text(
          frameOptions.text || "스캔해 주세요",
          pageWidth / 2,
          yPos + qrHeight + 20,
          { align: "center" },
        );
      }

      // 푸터 추가
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(
        "오픈소스 QR 코드 생성기 - https://github.com/w3labkr/nextjs14-qrcode",
        pageWidth / 2,
        pageHeight - 10,
        { align: "center" },
      );

      // PDF를 데이터 URL로 변환
      return doc.output("datauristring");
    } catch (error) {
      console.error("PDF 생성 중 오류 발생:", error);
      return "";
    } finally {
      setIsGenerating(false);
    }
  };

  return { generatePdf, isGenerating };
}

// 헥사코드를 RGB로 변환하는 유틸리티 함수
function hexToRgb(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}
