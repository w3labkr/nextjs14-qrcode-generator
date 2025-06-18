"use server";

import type {
  Options as QRCodeStylingOptions,
  DotType,
  CornerSquareType,
  FileType,
} from "qr-code-styling-node";
import { JSDOM } from "jsdom";
import QRCode from "qrcode";

// qr-code-styling-node requires a DOM environment.
// Polyfill must run before the library is imported.
if (typeof window === "undefined") {
  const dom = new JSDOM();
  // @ts-ignore
  global.window = dom.window;
  // @ts-ignore
  global.document = dom.window.document;
  // @ts-ignore
  global.self = dom.window;
}

const QRCodeStyling = require("qr-code-styling-node");
const { Canvas, Image } = require("canvas");

// qr-code-styling-node requires a DOM environment.
// Polyfill must run before the library is imported.
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

const qrCodeStyling = new QRCodeStyling({
  nodeCanvas: Canvas,
  jsdom: JSDOM,
});

// Re-exporting types for frontend usage
export type { DotType, CornerSquareType };

export interface QrCodeOptions {
  text: string;
  type?: "png" | "jpeg" | "svg" | "webp" | "pdf";
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

    if (type === "pdf") {
      // PDF is handled separately and not via this API route for direct image response.
      throw new Error("PDF generation is not supported through this endpoint.");
    }

    const encodedText = text;

    // 한글 텍스트 처리를 위한 UTF-8 인코딩 확인
    const hasKorean = /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/.test(text);

    if (
      hasKorean &&
      type !== "pdf" &&
      !logo &&
      !dotsOptions &&
      !cornersSquareOptions
    ) {
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

      if (type === "svg") {
        const svgString = await QRCode.toString(encodedText, {
          ...qrOptions,
          type: "svg",
        });
        return `data:image/svg+xml;base64,${Buffer.from(svgString).toString(
          "base64",
        )}`;
      } else {
        // 기본 PNG 또는 기타 형식
        const imageMimeType = `image/${type}` as
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

    const qrCode = new QRCodeStyling(stylingOptions);
    const buffer = await qrCode.getRawData(type as FileType);

    if (!buffer) {
      throw new Error("Generated QR code buffer is empty.");
    }

    return `data:image/${type};base64,${buffer.toString("base64")}`;
  } catch (error) {
    console.error("Error generating QR code:", error);
    throw new Error("Failed to generate QR code");
  }
}
