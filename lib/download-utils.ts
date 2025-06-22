export const downloadQrCode = async (
  content: string,
  type: string,
  settings: any,
  title?: string | null,
) => {
  try {
    // QR 코드 생성을 위한 모듈 동적 임포트
    const { generateQrCode } = await import("@/app/actions/qr-code");

    // 설정값 기본값 설정
    const qrSettings = {
      text: content,
      type: "png" as const,
      width: settings?.width || 400,
      color: {
        dark: settings?.foregroundColor || "#000000",
        light: settings?.backgroundColor || "#ffffff",
      },
      logo: settings?.logo || undefined,
    };

    // QR 코드 생성
    const qrCodeDataUrl = await generateQrCode(qrSettings);

    // 다운로드 파일명 생성
    const filename = title
      ? `${title
          .replace(/[^a-zA-Z0-9가-힣\s]/g, "")
          .trim()
          .replace(/\s+/g, "-")}.png`
      : `qrcode-${type.toLowerCase()}-${new Date().toISOString().slice(0, 10)}.png`;

    // Data URL을 Blob으로 변환
    const response = await fetch(qrCodeDataUrl);
    const blob = await response.blob();

    // 다운로드 링크 생성 및 클릭
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    return { success: true };
  } catch (error) {
    console.error("QR 코드 다운로드 오류:", error);
    return { success: false, error: "다운로드에 실패했습니다." };
  }
};
