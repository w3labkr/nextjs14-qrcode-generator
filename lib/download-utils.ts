export const downloadQrCode = async (
  content: string,
  type: string,
  settings: any,
  title?: string | null,
  format: string = "png",
) => {
  try {
    // QR 코드 생성을 위한 모듈 동적 임포트
    const { generateQrCode } = await import("@/app/actions/qr-code-generator");

    // 설정값 파싱
    let parsedSettings = settings;
    if (typeof settings === "string") {
      try {
        parsedSettings = JSON.parse(settings);
      } catch (e) {
        console.warn("Settings 파싱 오류, 기본값 사용:", e);
        parsedSettings = {};
      }
    }

    // 설정값 기본값 설정
    const qrSettings = {
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

    // 디버깅을 위한 로그 (개발환경에서만)
    if (
      typeof window !== "undefined" &&
      process.env.NODE_ENV === "development"
    ) {
      console.log(
        "Download QR Code - Format:",
        format,
        "Settings:",
        qrSettings,
      );
    }

    // PDF 형식의 경우 별도 처리 (클라이언트 사이드에서)
    if (format === "pdf") {
      // PDF용으로는 SVG로 먼저 생성
      const svgSettings = { ...qrSettings, type: "svg" as const };
      const svgDataUrl = await generateQrCode(svgSettings);

      // jsPDF를 동적으로 임포트하여 클라이언트에서 PDF 생성
      const { jsPDF } = await import("jspdf");

      const doc = new jsPDF({
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

      // SVG Base64 데이터에서 실제 SVG 내용 추출
      const base64Data = svgDataUrl.split(",")[1];
      const svgContent = atob(base64Data);

      // SVG를 이미지로 변환하여 PDF에 추가
      try {
        // SVG 데이터가 유효한지 확인
        if (base64Data && base64Data.length > 0) {
          // SVG 추가 시도
          doc.addImage(base64Data, "SVG", xPos, yPos, qrWidth, qrHeight);
        } else {
          throw new Error("유효하지 않은 SVG 데이터");
        }
      } catch (error) {
        // SVG 추가가 실패하면 PNG로 대체 생성
        console.warn("SVG 추가 실패, PNG로 대체:", error);
        try {
          const pngSettings = { ...qrSettings, type: "png" as const };
          const pngDataUrl = await generateQrCode(pngSettings);
          const pngImageData = pngDataUrl.split(",")[1];

          if (pngImageData && pngImageData.length > 0) {
            doc.addImage(pngImageData, "PNG", xPos, yPos, qrWidth, qrHeight);
          } else {
            throw new Error("PNG 대체 생성 실패");
          }
        } catch (fallbackError) {
          console.error("PNG 대체 생성도 실패:", fallbackError);
          throw new Error("PDF에 QR 코드 이미지를 추가할 수 없습니다");
        }
      }

      // 생성 날짜 추가
      const now = new Date();
      const dateStr = `${now.getFullYear()}-${String(
        now.getMonth() + 1,
      ).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
      doc.setFontSize(10);
      doc.text(`생성일: ${dateStr}`, pageWidth / 2, pageHeight - 20, {
        align: "center",
      });

      // PDF를 Blob으로 생성하여 다운로드
      const pdfBlob = doc.output("blob");
      const url = window.URL.createObjectURL(pdfBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = title
        ? `${title
            .replace(/[^a-zA-Z0-9가-힣\s]/g, "")
            .trim()
            .replace(/\s+/g, "-")}.pdf`
        : `qrcode-${type.toLowerCase()}-${new Date().toISOString().slice(0, 10)}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      return { success: true };
    }

    // 선택된 형식으로 QR 코드 생성
    const qrCodeDataUrl = await generateQrCode(qrSettings);

    // 다운로드 파일명 생성
    const fileExtension = format === "jpeg" ? "jpg" : format;
    const filename = title
      ? `${title
          .replace(/[^a-zA-Z0-9가-힣\s]/g, "")
          .trim()
          .replace(/\s+/g, "-")}.${fileExtension}`
      : `qrcode-${type.toLowerCase()}-${new Date().toISOString().slice(0, 10)}.${fileExtension}`;

    // SVG의 경우 특별한 처리
    if (format === "svg") {
      // Base64로 인코딩된 SVG 디코딩
      const base64Data = qrCodeDataUrl.split(",")[1];
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
    } else {
      // 다른 형식의 경우 기존 방식 사용
      const response = await fetch(qrCodeDataUrl);
      const blob = await response.blob();

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    }

    return { success: true };
  } catch (error) {
    console.error("QR 코드 다운로드 오류:", error);
    return { success: false, error: "다운로드에 실패했습니다." };
  }
};
