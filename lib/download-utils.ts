import axios from "axios";

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
  const fileExtension = format === "jpg" ? "jpg" : format;
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

// 안전한 파일 다운로드 함수 (개선된 버전)
export const downloadFileSecure = (blob: Blob, filename: string) => {
  try {
    // 브라우저 호환성 체크
    if (typeof window === "undefined") {
      throw new Error("서버 사이드에서는 파일 다운로드를 지원하지 않습니다.");
    }

    // URL 생성
    const url = URL.createObjectURL(blob);

    // 여러 방법으로 다운로드 시도
    const tryDownload = () => {
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      link.style.display = "none";
      link.style.visibility = "hidden";

      // DOM에 추가
      document.body.appendChild(link);

      // 클릭 이벤트 강제 실행
      if (link.click) {
        link.click();
      } else {
        // 구형 브라우저 호환성
        const event = new MouseEvent("click", {
          view: window,
          bubbles: true,
          cancelable: true,
        });
        link.dispatchEvent(event);
      }

      // 정리 작업
      setTimeout(() => {
        if (document.body.contains(link)) {
          document.body.removeChild(link);
        }
        URL.revokeObjectURL(url);
      }, 1000);
    };

    // 즉시 실행
    tryDownload();

    // 백업 방법: navigator.msSaveBlob (IE 지원)
    if ((navigator as any).msSaveBlob) {
      (navigator as any).msSaveBlob(blob, filename);
    }
  } catch (error) {
    console.error("파일 다운로드 오류:", error);
    throw new Error("파일 다운로드에 실패했습니다.");
  }
};

// JSON 데이터 내보내기 함수
export const downloadAsJSON = (data: any, filename?: string) => {
  try {
    const jsonContent = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonContent], {
      type: "application/json;charset=utf-8",
    });

    const defaultFilename = `qr-data-export-${new Date().toISOString().split("T")[0]}.json`;
    const finalFilename = filename || defaultFilename;

    // 먼저 기본 방법 시도
    try {
      downloadFileSecure(blob, finalFilename);
    } catch (error) {
      console.warn("Primary download method failed, trying fallback:", error);
      // 실패 시 대안 방법 시도
      if (!fallbackDownload(blob, finalFilename)) {
        throw new Error("모든 다운로드 방법이 실패했습니다.");
      }
    }
  } catch (error) {
    console.error("JSON 다운로드 오류:", error);
    throw error;
  }
};

// CSV 데이터 내보내기 함수
export const downloadAsCSV = (csvContent: string, filename: string) => {
  try {
    const blob = new Blob(["\uFEFF" + csvContent], {
      type: "text/csv;charset=utf-8",
    });

    // 먼저 기본 방법 시도
    try {
      downloadFileSecure(blob, filename);
    } catch (error) {
      console.warn("Primary download method failed, trying fallback:", error);
      // 실패 시 대안 방법 시도
      if (!fallbackDownload(blob, filename)) {
        throw new Error("모든 다운로드 방법이 실패했습니다.");
      }
    }
  } catch (error) {
    console.error("CSV 다운로드 오류:", error);
    throw error;
  }
};

// 다중 CSV 파일 다운로드 함수
export const downloadMultipleCSV = async (
  files: Array<{ content: string; filename: string }>,
  delay: number = 500,
) => {
  try {
    for (let i = 0; i < files.length; i++) {
      const { content, filename } = files[i];

      // 각 파일 다운로드
      downloadAsCSV(content, filename);

      // 파일 간 지연시간 추가 (브라우저가 다운로드를 처리할 시간 제공)
      if (i < files.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  } catch (error) {
    console.error("다중 CSV 다운로드 오류:", error);
    throw error;
  }
};

// 단일 압축 파일로 다중 CSV 다운로드 (선택적 기능)
export const downloadCSVAsZip = async (
  files: Array<{ content: string; filename: string }>,
  zipFilename?: string,
) => {
  try {
    // JSZip이 설치되어 있다면 사용
    if (typeof window !== "undefined" && (window as any).JSZip) {
      const JSZip = (window as any).JSZip;
      const zip = new JSZip();

      // 각 CSV 파일을 ZIP에 추가
      files.forEach(({ content, filename }) => {
        zip.file(filename, "\uFEFF" + content);
      });

      // ZIP 파일 생성 및 다운로드
      const zipBlob = await zip.generateAsync({ type: "blob" });
      const finalZipFilename =
        zipFilename ||
        `csv-export-${new Date().toISOString().split("T")[0]}.zip`;

      downloadFileSecure(zipBlob, finalZipFilename);
    } else {
      // JSZip이 없으면 개별 파일로 다운로드
      console.warn("JSZip not available, downloading files individually");
      await downloadMultipleCSV(files);
    }
  } catch (error) {
    console.error("ZIP 다운로드 오류:", error);
    // 실패 시 개별 파일로 다운로드
    await downloadMultipleCSV(files);
  }
};

// SVG를 Canvas를 통해 PNG로 변환하는 함수
const convertSvgToPng = async (
  svgDataUrl: string,
  width: number = 1024,
): Promise<string> => {
  return new Promise((resolve, reject) => {
    try {
      let svgContent: string;

      // SVG 데이터 URL에서 콘텐츠 추출
      if (svgDataUrl.startsWith("data:image/svg+xml;base64,")) {
        // Base64로 인코딩된 경우
        const base64Data = svgDataUrl.split(",")[1];
        svgContent = atob(base64Data);
      } else if (svgDataUrl.startsWith("data:image/svg+xml,")) {
        // URL 인코딩된 경우
        svgContent = decodeURIComponent(svgDataUrl.split(",")[1]);
      } else {
        reject(new Error("지원하지 않는 SVG 데이터 형식입니다."));
        return;
      }

      // SVG 콘텐츠 검증 및 정리
      if (!svgContent.includes("<svg")) {
        reject(new Error("유효하지 않은 SVG 콘텐츠입니다."));
        return;
      }

      // SVG를 Blob으로 변환하여 안전하게 처리
      const svgBlob = new Blob([svgContent], {
        type: "image/svg+xml;charset=utf-8",
      });
      const svgUrl = URL.createObjectURL(svgBlob);

      // SVG를 이미지로 로드
      const img = new Image();
      img.onload = () => {
        try {
          // Canvas 생성
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");

          if (!ctx) {
            URL.revokeObjectURL(svgUrl);
            reject(new Error("Canvas context를 생성할 수 없습니다."));
            return;
          }

          // Canvas 크기 설정
          canvas.width = width;
          canvas.height = width;

          // 배경을 흰색으로 설정 (투명도 방지)
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, width, width);

          // SVG 이미지를 Canvas에 그리기
          ctx.drawImage(img, 0, 0, width, width);

          // Canvas를 PNG 데이터 URL로 변환
          const pngDataUrl = canvas.toDataURL("image/png", 1.0);

          // 메모리 정리
          URL.revokeObjectURL(svgUrl);
          resolve(pngDataUrl);
        } catch (canvasError) {
          URL.revokeObjectURL(svgUrl);
          reject(new Error(`Canvas 처리 중 오류: ${canvasError}`));
        }
      };

      img.onerror = (error) => {
        URL.revokeObjectURL(svgUrl);
        console.error("SVG 로드 오류:", error);
        reject(new Error("SVG 이미지 로드에 실패했습니다."));
      };

      // SVG URL 설정
      img.src = svgUrl;

      // 타임아웃 설정 (10초)
      setTimeout(() => {
        URL.revokeObjectURL(svgUrl);
        reject(new Error("SVG 로드 시간이 초과되었습니다."));
      }, 10000);
    } catch (error) {
      console.error("SVG 변환 오류:", error);
      reject(new Error(`SVG 변환 중 오류: ${error}`));
    }
  });
};

// SVG로 다운로드하는 함수
const downloadAsSvg = async (qrCodeDataUrl: string, filename: string) => {
  const response = await axios.get(qrCodeDataUrl, { responseType: "blob" });
  downloadFile(response.data, filename);
};

// 일반 이미지 형식으로 다운로드하는 함수
const downloadAsImage = async (
  qrCodeDataUrl: string,
  filename: string,
  format: string = "png",
) => {
  // SVG를 PNG로 변환하는 경우 특별 처리
  if (qrCodeDataUrl.includes("data:image/svg+xml") && format === "png") {
    try {
      const pngDataUrl = await convertSvgToPng(qrCodeDataUrl, 1024); // 고품질을 위해 1024x1024로 변환
      const response = await axios.get(pngDataUrl, { responseType: "blob" });
      downloadFile(response.data, filename);
      return;
    } catch (error) {
      console.warn("SVG to PNG 변환 실패, PNG로 직접 생성 시도:", error);

      // SVG 변환 실패 시 서버에서 PNG로 직접 생성하도록 함
      throw error;
    }
  }

  const response = await axios.get(qrCodeDataUrl, { responseType: "blob" });
  downloadFile(response.data, filename);
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
      await downloadAsImage(qrCodeDataUrl, filename, format);
    }

    return { success: true };
  } catch (error) {
    console.error("QR 코드 다운로드 오류:", error);

    // SVG to PNG 변환 실패 시 PNG로 직접 재시도
    if (
      format === "png" &&
      error instanceof Error &&
      error.message.includes("SVG")
    ) {
      try {
        console.log("PNG로 직접 생성 재시도...");
        const { generateQrCode } = await import(
          "@/app/actions/qr-code-generator"
        );
        const pngSettings = parseQrSettings(settings, content, "png");

        const pngDataUrl = await generateQrCode(pngSettings);
        const filename = generateFileName(title, type, "png");

        const response = await axios.get(pngDataUrl, { responseType: "blob" });
        downloadFile(response.data, filename);

        return { success: true };
      } catch (retryError) {
        console.error("PNG 재시도도 실패:", retryError);
        return { success: false, error: "다운로드에 실패했습니다." };
      }
    }

    return { success: false, error: "다운로드에 실패했습니다." };
  }
};

// 대안적인 다운로드 방법 (FileSaver.js 스타일)
const fallbackDownload = (blob: Blob, filename: string) => {
  try {
    // Chrome, Firefox, Safari 등에서 작동하는 방법
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.style.display = "none";
    a.href = url;
    a.download = filename;

    // 사용자 상호작용 컨텍스트에서 실행
    document.body.appendChild(a);

    // 클릭 이벤트를 신뢰할 수 있는 이벤트로 만들기
    const clickEvent = new MouseEvent("click", {
      view: window,
      bubbles: true,
      cancelable: true,
    });

    a.dispatchEvent(clickEvent);

    // 정리
    setTimeout(() => {
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    }, 100);

    return true;
  } catch (error) {
    console.warn("Fallback download failed:", error);
    return false;
  }
};
