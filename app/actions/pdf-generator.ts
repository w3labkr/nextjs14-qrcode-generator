"use server";

import { JsPDF } from "jspdf";

export async function generatePdfQrCode(dataUrl: string): Promise<string> {
  try {
    const doc = new JsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    // A4 크기는 210mm x 297mm
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // QR 코드 이미지 크기 (페이지 중앙에 위치하도록)
    const qrWidth = 100; // mm
    const qrHeight = 100; // mm

    // QR 코드를 페이지 중앙에 배치
    const xPos = (pageWidth - qrWidth) / 2;
    const yPos = (pageHeight - qrHeight) / 2;

    // 제목 추가
    doc.setFontSize(16);
    doc.text("QR 코드", pageWidth / 2, 20, { align: "center" });

    // 이미지 추가 (data URL에서 'data:image/png;base64,' 부분 제거)
    const imageData = dataUrl.split(",")[1];
    doc.addImage(
      imageData,
      dataUrl.includes("image/svg")
        ? "SVG"
        : dataUrl.includes("image/jpeg")
          ? "JPEG"
          : "PNG",
      xPos,
      yPos,
      qrWidth,
      qrHeight,
    );

    // 생성 날짜 추가
    const now = new Date();
    const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
    doc.setFontSize(10);
    doc.text(`생성일: ${dateStr}`, pageWidth / 2, pageHeight - 20, {
      align: "center",
    });

    // PDF를 base64 문자열로 변환
    const pdfOutput = doc.output("datauristring");
    return pdfOutput;
  } catch (err) {
    console.error("PDF 생성 오류:", err);
    throw new Error("PDF 생성에 실패했습니다.");
  }
}
