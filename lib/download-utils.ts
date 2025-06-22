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
