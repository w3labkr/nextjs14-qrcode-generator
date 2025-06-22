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
    const { jsPDF } =
      format === "pdf" ? await import("jspdf") : { jsPDF: null };

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
      if (!jsPDF) {
        throw new Error("PDF 생성에 필요한 모듈을 불러오지 못했습니다.");
      }
      // PDF용으로는 SVG로 먼저 생성
      const svgSettings = { ...qrSettings, type: "svg" as const };
      const svgDataUrl = await generateQrCode(svgSettings);

      // jsPDF를 동적으로 임포트하여 클라이언트에서 PDF 생성
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

      // SVG를 Canvas로 변환한 후 PDF에 추가하는 더 안정적인 방식
      const svgToCanvas = async (svgDataUrl: string): Promise<string> => {
        return new Promise((resolve, reject) => {
          const base64Data = svgDataUrl.split(",")[1];
          const svgContent = atob(base64Data);

          // SVG를 이미지 엘리먼트로 로드
          const img = new Image();
          img.onload = () => {
            // Canvas 생성
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");

            if (!ctx) {
              reject(new Error("Canvas context를 생성할 수 없습니다"));
              return;
            }

            // 고해상도를 위해 Canvas 크기 설정
            const scale = 4; // 4배 확대로 고품질 유지
            canvas.width = qrWidth * 10 * scale; // mm to px 변환 (대략 10px/mm)
            canvas.height = qrHeight * 10 * scale;

            // 배경을 흰색으로 채움 (PDF에서 투명도 문제 방지)
            ctx.fillStyle = qrSettings.color?.light || "#ffffff";
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // 이미지 그리기
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

            // Canvas를 PNG로 변환
            const pngDataUrl = canvas.toDataURL("image/png");
            resolve(pngDataUrl);
          };

          img.onerror = () => {
            reject(new Error("SVG 이미지 로드에 실패했습니다"));
          };

          // SVG 데이터를 이미지로 로드
          const svgBlob = new Blob([svgContent], { type: "image/svg+xml" });
          const url = URL.createObjectURL(svgBlob);
          img.src = url;

          // 메모리 정리를 위한 타이머 설정
          setTimeout(() => {
            URL.revokeObjectURL(url);
          }, 5000);
        });
      };

      try {
        // SVG를 Canvas로 변환한 후 PNG로 PDF에 추가
        const pngDataUrl = await svgToCanvas(svgDataUrl);
        const pngImageData = pngDataUrl.split(",")[1];

        if (pngImageData && pngImageData.length > 0) {
          doc.addImage(pngImageData, "PNG", xPos, yPos, qrWidth, qrHeight);
        } else {
          throw new Error("Canvas 변환에 실패했습니다");
        }
      } catch (error) {
        // Canvas 변환이 실패하면 PNG로 직접 생성
        console.warn("SVG Canvas 변환 실패, PNG로 대체:", error);
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
