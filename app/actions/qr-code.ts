"use server";

import QRCode from "qrcode";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

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
      margin = 0,
      color,
      // logo, dotsOptions, cornersSquareOptions are ignored as they are not supported in Edge.
    } = options;

    // Input validation
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

// 고해상도 QR 코드 생성 (로그인 사용자 전용)
export async function generateHighResQrCode(
  options: QrCodeOptions,
): Promise<string> {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error(
      "High-resolution QR codes are only available for logged-in users",
    );
  }

  // 고해상도 옵션으로 덮어쓰기
  const highResOptions = {
    ...options,
    width: 4096, // 4K resolution
  };

  return generateQrCode(highResOptions);
}

// QR 코드 생성과 동시에 로그인한 사용자에게는 히스토리에 저장
export async function generateAndSaveQrCode(
  options: QrCodeOptions & {
    title?: string;
    qrType: "URL" | "TEXT" | "WIFI" | "EMAIL" | "SMS" | "VCARD" | "LOCATION";
  },
) {
  try {
    // QR 코드 생성
    const qrCodeDataUrl = await generateQrCode(options);

    // 사용자 세션 확인
    const session = await auth();

    // 로그인한 사용자인 경우 데이터베이스에 저장
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

// 사용자의 QR 코드 히스토리 조회
export async function getUserQrCodes(page = 1, limit = 10) {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const skip = (page - 1) * limit;

  const [qrCodes, totalCount] = await Promise.all([
    prisma.qrCode.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: limit,
    }),
    prisma.qrCode.count({
      where: {
        userId: session.user.id,
      },
    }),
  ]);

  return {
    qrCodes,
    totalCount,
    totalPages: Math.ceil(totalCount / limit),
    currentPage: page,
  };
}

// QR 코드 즐겨찾기 토글
export async function toggleQrCodeFavorite(qrCodeId: string) {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const qrCode = await prisma.qrCode.findFirst({
    where: {
      id: qrCodeId,
      userId: session.user.id,
    },
  });

  if (!qrCode) {
    throw new Error("QR Code not found");
  }

  const updatedQrCode = await prisma.qrCode.update({
    where: {
      id: qrCodeId,
    },
    data: {
      isFavorite: !qrCode.isFavorite,
    },
  });

  return updatedQrCode;
}

// QR 코드 삭제
export async function deleteQrCode(qrCodeId: string) {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const qrCode = await prisma.qrCode.findFirst({
    where: {
      id: qrCodeId,
      userId: session.user.id,
    },
  });

  if (!qrCode) {
    throw new Error("QR Code not found");
  }

  await prisma.qrCode.delete({
    where: {
      id: qrCodeId,
    },
  });

  return { success: true };
}

// 템플릿 관련 액션들

// 사용자의 템플릿 목록 조회
export async function getUserTemplates() {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const templates = await prisma.qrTemplate.findMany({
    where: {
      userId: session.user.id,
    },
    orderBy: [{ isDefault: "desc" }, { updatedAt: "desc" }],
  });

  return templates;
}

// 템플릿 저장
export async function saveTemplate(data: {
  name: string;
  settings: QrCodeOptions;
  isDefault?: boolean;
}) {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const { name, settings, isDefault = false } = data;

  // 기본 템플릿으로 설정하는 경우, 다른 템플릿들의 기본 설정 해제
  if (isDefault) {
    await prisma.qrTemplate.updateMany({
      where: {
        userId: session.user.id,
        isDefault: true,
      },
      data: {
        isDefault: false,
      },
    });
  }

  const template = await prisma.qrTemplate.create({
    data: {
      userId: session.user.id,
      name,
      settings: JSON.stringify(settings),
      isDefault,
    },
  });

  return template;
}

// 템플릿 업데이트
export async function updateTemplate(
  templateId: string,
  data: {
    name?: string;
    settings?: QrCodeOptions;
    isDefault?: boolean;
  },
) {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  // 템플릿 소유권 확인
  const template = await prisma.qrTemplate.findFirst({
    where: {
      id: templateId,
      userId: session.user.id,
    },
  });

  if (!template) {
    throw new Error("Template not found");
  }

  const { name, settings, isDefault } = data;

  // 기본 템플릿으로 설정하는 경우, 다른 템플릿들의 기본 설정 해제
  if (isDefault) {
    await prisma.qrTemplate.updateMany({
      where: {
        userId: session.user.id,
        isDefault: true,
      },
      data: {
        isDefault: false,
      },
    });
  }

  const updatedTemplate = await prisma.qrTemplate.update({
    where: {
      id: templateId,
    },
    data: {
      ...(name && { name }),
      ...(settings && { settings: JSON.stringify(settings) }),
      ...(isDefault !== undefined && { isDefault }),
    },
  });

  return updatedTemplate;
}

// 템플릿 삭제
export async function deleteTemplate(templateId: string) {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const template = await prisma.qrTemplate.findFirst({
    where: {
      id: templateId,
      userId: session.user.id,
    },
  });

  if (!template) {
    throw new Error("Template not found");
  }

  await prisma.qrTemplate.delete({
    where: {
      id: templateId,
    },
  });

  return { success: true };
}

// 기본 템플릿 가져오기
export async function getDefaultTemplate() {
  const session = await auth();

  if (!session?.user?.id) {
    return null;
  }

  const defaultTemplate = await prisma.qrTemplate.findFirst({
    where: {
      userId: session.user.id,
      isDefault: true,
    },
  });

  return defaultTemplate;
}
