"use server";

import QRCode from "qrcode";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { QrCodeOptions, QrCodeGenerationOptions } from "@/types/qr-code-server";

export async function generateQrCode(options: QrCodeOptions): Promise<string> {
  try {
    const { text, type = "png", width = 400, margin = 0, color } = options;

    if (!text || text.trim().length === 0) {
      throw new Error("QR code text cannot be empty.");
    }

    if (width < 100 || width > 4096) {
      throw new Error("QR code width must be between 100px and 4096px.");
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
        ...qrcodeOptions,
        type: "svg",
      });
      return `data:image/svg+xml,${encodeURIComponent(svgString)}`;
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

export async function generateHighResQrCode(
  options: QrCodeOptions,
): Promise<string> {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error(
      "High-resolution QR codes are only available for logged-in users",
    );
  }

  const highResOptions = {
    ...options,
    width: 4096,
  };

  return generateQrCode(highResOptions);
}

export async function generateAndSaveQrCode(options: QrCodeGenerationOptions) {
  try {
    const qrCodeDataUrl = await generateQrCode(options);

    const session = await auth();

    if (session?.user?.id) {
      const savedQrCode = await prisma.qrCode.create({
        data: {
          userId: session.user.id,
          type: options.qrType,
          title: options.title || null,
          content: options.text,
          settings: JSON.stringify({
            color: options.color,
            width: options.width,
            margin: options.margin,
            logo: options.logo,
            dotsOptions: options.dotsOptions,
            cornersSquareOptions: options.cornersSquareOptions,
            frameOptions: options.frameOptions,
          }),
        },
      });

      return {
        qrCodeDataUrl,
        savedId: savedQrCode.id,
      };
    }

    return {
      qrCodeDataUrl,
      savedId: null,
    };
  } catch (error) {
    console.error("Error generating and saving QR code:", error);
    throw error;
  }
}
