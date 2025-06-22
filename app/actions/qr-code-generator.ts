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

    // 디버깅을 위한 색상 로깅 (개발환경에서만)
    if (process.env.NODE_ENV === "development") {
      console.log("QR Code generation - Type:", type, "Colors:", color);
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

      // SVG에서 색상이 올바르게 적용되는지 확인하고 수정
      let modifiedSvg = svgString;
      if (color?.dark && color.dark !== "#000000") {
        // SVG 내의 검은색 요소를 지정된 색상으로 변경
        modifiedSvg = svgString
          .replace(/fill="#000000"/g, `fill="${color.dark}"`)
          .replace(/fill="#000"/g, `fill="${color.dark}"`)
          .replace(/fill="black"/g, `fill="${color.dark}"`)
          .replace(/fill="rgb\(0,\s*0,\s*0\)"/g, `fill="${color.dark}"`)
          .replace(/stroke="#000000"/g, `stroke="${color.dark}"`)
          .replace(/stroke="#000"/g, `stroke="${color.dark}"`)
          .replace(/stroke="black"/g, `stroke="${color.dark}"`);
      }

      // Base64 인코딩으로 안정적인 브라우저 호환성 제공
      return `data:image/svg+xml;base64,${Buffer.from(modifiedSvg).toString("base64")}`;
    }

    if (type === "jpeg") {
      // JPEG의 경우 투명도를 지원하지 않으므로 배경색이 중요함
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
      // 사용자가 실제로 데이터베이스에 존재하는지 확인
      const existingUser = await prisma.user.findUnique({
        where: { id: session.user.id },
      });

      if (existingUser) {
        const savedQrCode = await prisma.qrCode.create({
          data: {
            userId: session.user.id,
            type: options.qrType,
            title: options.title || null,
            content: options.text,
            settings: JSON.stringify({
              type: options.type,
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
      } else {
        console.warn(`User with ID ${session.user.id} not found in database`);
      }
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
