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
      frameOptions,
    } = options;

    // PDF는 별도의 처리가 필요하므로 여기서는 먼저 QR 코드를 생성한 후 PDF 생성 함수를 호출하도록 함
    if (type === "pdf") {
      // PDF를 생성하려면 먼저 이미지 형태의 QR 코드가 필요합니다.
      // PNG 형식으로 QR 코드를 생성한 후 PDF로 변환합니다.
      const pngOptions = {
        ...options,
        type: "png" as const,
      };
      const pngData = await generateQrCode(pngOptions);

      // PDF 생성을 위한 함수는 별도로 구현해야 함 (actions/pdf-generator.ts)
      // 이 위치에서는 아직 구현하지 않음
      return pngData;
    }

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
        color: cornersSquareOptions?.color || color?.dark || "#000000",
        type: cornersSquareOptions?.type || "square",
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
