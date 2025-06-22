/**
 * SVG 데이터에서 콘텐츠를 추출하는 함수
 */
const extractSvgContent = (svgDataUrl: string): string => {
  if (svgDataUrl.startsWith("data:image/svg+xml;base64,")) {
    const base64Data = svgDataUrl.split(",")[1];
    if (!base64Data) throw new Error("Base64 데이터가 없습니다.");
    return atob(base64Data);
  }

  if (svgDataUrl.startsWith("data:image/svg+xml;charset=utf-8,")) {
    return decodeURIComponent(svgDataUrl.split(",")[1]);
  }

  if (svgDataUrl.startsWith("data:image/svg+xml,")) {
    return decodeURIComponent(svgDataUrl.split(",")[1]);
  }

  if (svgDataUrl.startsWith("<svg")) {
    return svgDataUrl;
  }

  throw new Error(
    `지원하지 않는 SVG 데이터 형식입니다. 형식: ${svgDataUrl.substring(0, 50)}...`,
  );
};

/**
 * SVG 콘텐츠를 검증하는 함수
 */
const validateSvgContent = (svgContent: string): void => {
  if (!svgContent || typeof svgContent !== "string") {
    throw new Error("SVG 콘텐츠가 비어있거나 유효하지 않습니다.");
  }

  if (!svgContent.includes("<svg")) {
    throw new Error("유효하지 않은 SVG 콘텐츠입니다.");
  }
};

/**
 * Canvas에 SVG 이미지를 그리는 함수
 */
const drawSvgToCanvas = (
  img: HTMLImageElement,
  canvas: HTMLCanvasElement,
  size: number,
): void => {
  const ctx = canvas.getContext("2d", { alpha: true });
  if (!ctx) throw new Error("Canvas context를 생성할 수 없습니다.");

  canvas.width = size;
  canvas.height = size;

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.clearRect(0, 0, size, size);

  const drawSize = Math.min(
    size,
    Math.max(img.naturalWidth || size, img.naturalHeight || size),
  );
  const offsetX = (size - drawSize) / 2;
  const offsetY = (size - drawSize) / 2;

  ctx.drawImage(img, offsetX, offsetY, drawSize, drawSize);
};

/**
 * SVG를 Canvas를 통해 PNG로 변환하는 함수
 */
export const convertSvgToPng = async (
  svgDataUrl: string,
  width: number = 1024,
): Promise<string> => {
  return new Promise((resolve, reject) => {
    try {
      const svgContent = extractSvgContent(svgDataUrl);
      validateSvgContent(svgContent);

      const svgBlob = new Blob([svgContent], {
        type: "image/svg+xml;charset=utf-8",
      });
      const svgUrl = URL.createObjectURL(svgBlob);

      const img = new Image();
      img.crossOrigin = "anonymous";

      img.onload = () => {
        try {
          const canvas = document.createElement("canvas");
          const size = Math.max(
            img.naturalWidth || width,
            img.naturalHeight || width,
            width,
          );

          drawSvgToCanvas(img, canvas, size);

          const pngDataUrl = canvas.toDataURL("image/png", 1.0);
          URL.revokeObjectURL(svgUrl);
          resolve(pngDataUrl);
        } catch (canvasError) {
          URL.revokeObjectURL(svgUrl);
          reject(
            new Error(
              `Canvas 처리 중 오류: ${canvasError instanceof Error ? canvasError.message : String(canvasError)}`,
            ),
          );
        }
      };

      img.onerror = () => {
        URL.revokeObjectURL(svgUrl);
        reject(
          new Error("SVG 이미지 로드에 실패했습니다. SVG 형식을 확인해주세요."),
        );
      };

      img.src = svgUrl;

      setTimeout(() => {
        URL.revokeObjectURL(svgUrl);
        reject(new Error("SVG 로드 시간이 초과되었습니다."));
      }, 15000);
    } catch (error) {
      reject(
        new Error(
          `SVG 변환 중 오류: ${error instanceof Error ? error.message : String(error)}`,
        ),
      );
    }
  });
};

/**
 * QR 코드 형식을 감지하는 함수
 */
export const detectQrCodeFormat = (qrCode: string): "svg" | "jpg" | "png" => {
  if (qrCode.includes("data:image/svg+xml")) return "svg";
  if (qrCode.includes("data:image/jpeg")) return "jpg";
  return "png";
};
