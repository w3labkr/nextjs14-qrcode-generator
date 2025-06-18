"use server";

import QRCode from "qrcode";

// Types for frontend compatibility.
// These were originally from qr-code-styling-node, which is not Edge-compatible.
export type DotType =
  | "dots"
  | "rounded"
  | "classy"
  | "classy-rounded"
  | "square"
  | "extra-rounded";
export type CornerSquareType = "dots" | "square" | "extra-rounded";

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
  // Advanced styling (no longer supported in Edge runtime)
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
      // logo, dotsOptions, cornersSquareOptions are ignored as they are not supported in Edge.
    } = options;

    // Input validation
    if (!text || text.trim().length === 0) {
      throw new Error("QR code text cannot be empty.");
    }

    if (width < 100 || width > 2000) {
      throw new Error("QR code width must be between 100px and 2000px.");
    }

    if (type === "pdf") {
      throw new Error("PDF output is not supported in the Edge runtime.");
    }

    const qrcodeOptions: QRCode.QRCodeRenderersOptions = {
      errorCorrectionLevel: "H",
      width,
      margin,
      color: {
        dark: color?.dark || "#000000",
        light: color?.light || "#ffffff",
      },
    };

    if (type === "svg") {
      const svgString = await QRCode.toString(text, {
        type: "svg",
        width,
        margin,
        color: {
          dark: color?.dark || "#000000",
          light: color?.light || "#ffffff",
        },
      });
      return `data:image/svg+xml;utf8,${encodeURIComponent(svgString)}`;
    }

    if (type === "jpeg") {
      return await QRCode.toDataURL(text, {
        ...qrcodeOptions,
        type: "image/jpeg",
      });
    }

    if (type === "webp") {
      return await QRCode.toDataURL(text, {
        ...qrcodeOptions,
        type: "image/webp",
      });
    }

    return await QRCode.toDataURL(text, {
      ...qrcodeOptions,
      type: "image/png",
    });
  } catch (error) {
    console.error("Error generating QR code:", error);
    if (error instanceof Error) {
      throw new Error(`Failed to generate QR code: ${error.message}`);
    }
    throw new Error("Failed to generate QR code.");
  }
}
