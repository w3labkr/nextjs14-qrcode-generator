"use server";

import QRCodeStyling, {
  Options as QRCodeStylingOptions,
  DotType,
  CornerSquareType,
} from "qr-code-styling-node";
import { JSDOM } from "jsdom";

// qr-code-styling-node requires a DOM environment.
if (typeof global.window === "undefined") {
  // @ts-ignore
  const dom = new JSDOM("", { url: "http://localhost" });
  // @ts-ignore
  global.window = dom.window;
  // @ts-ignore
  global.document = dom.window.document;
}

// Re-exporting types for frontend usage
export type { DotType, CornerSquareType };

export interface QrCodeOptions {
  text: string;
  type?: "png" | "jpeg" | "svg" | "webp";
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
}

export async function generateQrCode(options: QrCodeOptions) {
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

    const qrCodeStylingOptions: QRCodeStylingOptions = {
      width,
      height: width,
      margin,
      data: text,
      dotsOptions: {
        color: dotsOptions?.color || color?.dark || "#000000",
        type: dotsOptions?.type || "square",
      },
      backgroundOptions: {
        color: color?.light || "#ffffff",
      },
      cornersSquareOptions: {
        color: cornersSquareOptions?.color,
        type: cornersSquareOptions?.type,
      },
      qrOptions: {
        errorCorrectionLevel: "H",
      },
      imageOptions: {
        hideBackgroundDots: true,
        imageSize: 0.4,
        margin: 4,
      },
      nodeCanvas: require("canvas"),
      jsdom: JSDOM,
    };

    if (logo) {
      qrCodeStylingOptions.image = logo;
    }

    const qrCode = new QRCodeStyling(qrCodeStylingOptions);

    const buffer = await qrCode.getRawData(type);

    if (!buffer) {
      throw new Error("Failed to generate QR code buffer.");
    }

    const mimeType = type === "svg" ? "svg+xml" : type;
    return `data:image/${mimeType};base64,${buffer.toString("base64")}`;
  } catch (err) {
    console.error(err);
    throw new Error("QR 코드 생성에 실패했습니다.");
  }
}
