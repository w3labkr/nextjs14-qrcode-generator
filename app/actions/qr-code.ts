"use server";

import type {
  Options as QRCodeStylingOptions,
  DotType,
  CornerSquareType,
} from "qr-code-styling-node";
import { JSDOM } from "jsdom";
import QRCode from "qrcode";

// qr-code-styling-node requires a DOM environment.
// Polyfill must run before the library is imported.
let Canvas: any, Image: any;
let QRCodeStyling: any;

try {
  const canvasModule = require("canvas");
  Canvas = canvasModule.Canvas;
  Image = canvasModule.Image;

  if (typeof window === "undefined") {
    const dom = new JSDOM();
    // @ts-ignore
    global.window = dom.window;
    // @ts-ignore
    global.document = dom.window.document;
    // @ts-ignore
    global.self = dom.window;
    // @ts-ignore
    global.Image = Image;
  }

  QRCodeStyling = require("qr-code-styling-node");
} catch (error) {
  console.warn(
    "Failed to initialize qr-code-styling-node dependencies:",
    error,
  );
}

// Re-exporting types for frontend usage
export type { DotType, CornerSquareType };

// This type is not exported by the library, so we define it locally.
type FileType = "png" | "jpeg" | "svg" | "webp";

export interface QrCodeOptions {
  text: string;
  type?: FileType | "pdf";
  width?: number;
  margin?: number;
  // Basic styling
  color?: {
    dark?: string;
    light?: string;
  };
  logo?: string;
  // Advanced styling
  dotsOptions?: {
    type?: DotType;
    color?: string;
  };
  cornersSquareOptions?: {
    type?: CornerSquareType;
    color?: string;
  };
  // Frame options
  frameOptions?: {
    type?: string;
    text?: string;
    textColor?: string;
    backgroundColor?: string;
    borderColor?: string;
    borderWidth?: number;
    borderRadius?: number;
  };
}

export async function generateQrCode(options: QrCodeOptions): Promise<string> {
  try {
    const {
      text,
      type = "png",
      width = 400,
      margin = 10,
      color,
      logo,
      dotsOptions,
      cornersSquareOptions,
    } = options;

    // 입력값 검증
    if (!text || text.trim().length === 0) {
      throw new Error("QR 코드 텍스트가 비어있습니다.");
    }

    if (width < 100 || width > 2000) {
      throw new Error("QR 코드 크기는 100px에서 2000px 사이여야 합니다.");
    }

    if (type === "pdf") {
      throw new Error("PDF 생성은 이 엔드포인트에서 지원되지 않습니다.");
    }

    const finalType = type as FileType;
    const encodedText = text.trim();

    // 한글 텍스트 처리를 위한 UTF-8 인코딩 확인
    const hasKorean = /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/.test(text);

    if (hasKorean && !logo && !dotsOptions && !cornersSquareOptions) {
      // 한글이 포함되고 기본 스타일인 경우 qrcode 라이브러리 사용
      const qrOptions = {
        errorCorrectionLevel: "H" as const,
        margin: Math.floor(margin / 10),
        color: {
          dark: color?.dark || "#000000",
          light: color?.light || "#ffffff",
        },
        width: width,
      };

      if (finalType === "svg") {
        const svgString = await QRCode.toString(encodedText, {
          ...qrOptions,
          type: "svg",
        });
        return `data:image/svg+xml;base64,${Buffer.from(svgString).toString(
          "base64",
        )}`;
      } else {
        // 기본 PNG 또는 기타 형식
        const imageMimeType = `image/${finalType}` as
          | "image/png"
          | "image/jpeg"
          | "image/webp";
        const dataUrl = await QRCode.toDataURL(encodedText, {
          ...qrOptions,
          type: imageMimeType,
        });
        return dataUrl;
      }
    }

    // qr-code-styling-node 사용
    if (!QRCodeStyling || !Canvas) {
      // qr-code-styling-node를 사용할 수 없는 경우 기본 qrcode 라이브러리로 폴백
      console.warn(
        "qr-code-styling-node not available, falling back to basic qrcode library",
      );

      const qrOptions = {
        errorCorrectionLevel: "H" as const,
        margin: Math.floor(margin / 10),
        color: {
          dark: color?.dark || "#000000",
          light: color?.light || "#ffffff",
        },
        width: width,
      };

      if (finalType === "svg") {
        const svgString = await QRCode.toString(encodedText, {
          ...qrOptions,
          type: "svg",
        });
        return `data:image/svg+xml;base64,${Buffer.from(svgString).toString(
          "base64",
        )}`;
      } else {
        const imageMimeType = `image/${finalType}` as
          | "image/png"
          | "image/jpeg"
          | "image/webp";
        const dataUrl = await QRCode.toDataURL(encodedText, {
          ...qrOptions,
          type: imageMimeType,
        });
        return dataUrl;
      }
    }

    const stylingOptions: QRCodeStylingOptions = {
      width: width,
      height: width,
      margin: margin,
      data: encodedText,
      image: logo,
      dotsOptions: {
        color: color?.dark || "#000000",
        ...dotsOptions,
      },
      backgroundOptions: {
        color: color?.light || "#ffffff",
      },
      cornersSquareOptions: {
        ...cornersSquareOptions,
        color: cornersSquareOptions?.color || color?.dark || "#000000",
      },
    };

    const qrCode = new QRCodeStyling({
      ...stylingOptions,
      nodeCanvas: Canvas,
      jsdom: JSDOM,
    });

    const rawData = await qrCode.getRawData(finalType);

    if (!rawData) {
      throw new Error("Generated QR code buffer is empty.");
    }

    let buffer: Buffer;

    if (rawData instanceof Buffer) {
      buffer = rawData;
    } else if (rawData instanceof Uint8Array) {
      buffer = Buffer.from(rawData);
    } else if (rawData instanceof ArrayBuffer) {
      buffer = Buffer.from(rawData);
    } else if (typeof rawData === "string") {
      // SVG 문자열 처리
      if (finalType === "svg") {
        buffer = Buffer.from(rawData, "utf-8");
      } else {
        // base64 문자열일 가능성
        try {
          buffer = Buffer.from(rawData, "base64");
        } catch {
          buffer = Buffer.from(rawData, "utf-8");
        }
      }
    } else if (typeof rawData === "object" && rawData !== null) {
      // Blob 객체 처리 (Node.js 환경에서 더 직접적인 방법)
      if (rawData instanceof Blob || rawData.constructor?.name === "Blob") {
        try {
          // JSDOM의 FileReader를 사용하여 Blob을 ArrayBuffer로 변환
          const arrayBuffer = await new Promise<ArrayBuffer>(
            (resolve, reject) => {
              const { FileReader } = new JSDOM().window;
              const reader = new FileReader();

              reader.onload = () => {
                if (reader.result instanceof ArrayBuffer) {
                  resolve(reader.result);
                } else {
                  reject(new Error("Failed to read Blob as ArrayBuffer."));
                }
              };

              reader.onerror = () => {
                reject(reader.error || new Error("Blob reading failed."));
              };

              reader.readAsArrayBuffer(rawData as any);
            },
          );

          buffer = Buffer.from(arrayBuffer);
        } catch (blobError) {
          console.error("Blob 변환 실패:", blobError);
          throw new Error("QR 코드 데이터 변환 중 오류가 발생했습니다.");
        }
      } else if (
        "arrayBuffer" in rawData &&
        typeof rawData.arrayBuffer === "function"
      ) {
        // Blob-like 객체 처리
        try {
          const arrayBuffer = await rawData.arrayBuffer();
          buffer = Buffer.from(arrayBuffer);
        } catch (blobError) {
          console.error("Blob-like arrayBuffer 변환 실패:", blobError);
          throw new Error("QR 코드 데이터 변환 중 오류가 발생했습니다.");
        }
      } else if ("buffer" in rawData && rawData.buffer instanceof ArrayBuffer) {
        // TypedArray의 buffer 속성 처리
        buffer = Buffer.from(rawData.buffer);
      } else if (Array.isArray(rawData)) {
        // 배열 형태의 바이트 데이터 처리
        buffer = Buffer.from(rawData);
      } else {
        // 기타 객체 타입 - 직렬화 시도
        console.error("알 수 없는 객체 타입:", rawData);
        try {
          // 객체를 JSON으로 변환 후 Buffer로 처리 (최후의 수단)
          const stringified = JSON.stringify(rawData);
          buffer = Buffer.from(stringified, "utf-8");
        } catch {
          throw new Error("지원되지 않는 QR 코드 데이터 형식입니다.");
        }
      }
    } else {
      // 기본 변환 시도
      try {
        buffer = Buffer.from(rawData as any);
      } catch (conversionError) {
        console.error("Buffer 변환 실패:", conversionError);
        console.error("rawData value:", rawData);
        throw new Error("QR 코드 데이터를 처리할 수 없습니다.");
      }
    }

    return `data:image/${finalType};base64,${buffer.toString("base64")}`;
  } catch (error) {
    console.error("QR 코드 생성 오류:", error);

    // 더 구체적인 오류 정보 제공
    if (error instanceof Error) {
      // 알려진 오류 메시지인 경우 그대로 전달
      if (
        error.message.includes("텍스트가 비어있습니다") ||
        error.message.includes("크기는") ||
        error.message.includes("지원되지 않습니다") ||
        error.message.includes("데이터 변환 중 오류") ||
        error.message.includes("데이터를 처리할 수 없습니다")
      ) {
        throw error;
      }

      // Canvas 관련 오류
      if (
        error.message.includes("canvas") ||
        error.message.includes("Canvas")
      ) {
        throw new Error("Canvas 모듈 초기화 실패. 서버 환경을 확인해주세요.");
      }

      // JSDOM 관련 오류
      if (error.message.includes("jsdom") || error.message.includes("JSDOM")) {
        throw new Error("DOM 환경 초기화 실패. 서버 환경을 확인해주세요.");
      }

      // QR 코드 라이브러리 관련 오류
      if (
        error.message.includes("QRCode") ||
        error.message.includes("qr-code")
      ) {
        throw new Error("QR 코드 라이브러리 오류. 입력 데이터를 확인해주세요.");
      }

      throw new Error(`QR 코드 생성 실패: ${error.message}`);
    }

    throw new Error("QR 코드 생성 중 알 수 없는 오류가 발생했습니다.");
  }
}
