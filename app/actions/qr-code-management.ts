"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  QrCodeGenerationOptions,
  SaveQrCodeData,
} from "@/types/qr-code-server";
import { generateQrCode } from "./qr-code-generator";

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

export async function updateQrCode(
  qrCodeId: string,
  options: QrCodeGenerationOptions,
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const existingQrCode = await prisma.qrCode.findFirst({
      where: {
        id: qrCodeId,
        userId: session.user.id,
      },
    });

    if (!existingQrCode) {
      return { success: false, error: "QR Code not found" };
    }

    const qrCodeDataUrl = await generateQrCode(options);

    const updatedQrCode = await prisma.qrCode.update({
      where: {
        id: qrCodeId,
      },
      data: {
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
      success: true,
      qrCodeDataUrl,
      updatedQrCode,
    };
  } catch (error) {
    console.error("Error updating QR code:", error);
    return { success: false, error: "Failed to update QR code" };
  }
}

export async function saveQrCode(data: SaveQrCodeData) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      throw new Error("로그인이 필요합니다.");
    }

    const savedQrCode = await prisma.qrCode.create({
      data: {
        userId: session.user.id,
        type: data.type,
        title: data.title || null,
        content: data.content,
        settings: JSON.stringify(data.settings),
        isFavorite: false,
      },
    });

    return {
      success: true,
      qrCode: {
        ...savedQrCode,
        settings: JSON.parse(savedQrCode.settings),
      },
    };
  } catch (error) {
    console.error("QR 코드 저장 실패:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "QR 코드 저장에 실패했습니다.",
    };
  }
}

export async function getQrCodeStats() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      throw new Error("로그인이 필요합니다.");
    }

    const userId = session.user.id;
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [total, favorites, thisMonth, typeStats] = await Promise.all([
      prisma.qrCode.count({ where: { userId } }),
      prisma.qrCode.count({ where: { userId, isFavorite: true } }),
      prisma.qrCode.count({
        where: {
          userId,
          createdAt: { gte: startOfMonth },
        },
      }),
      prisma.qrCode.groupBy({
        by: ["type"],
        where: { userId },
        _count: true,
      }),
    ]);

    const byType = typeStats.reduce(
      (acc, stat) => {
        acc[stat.type] = stat._count;
        return acc;
      },
      {} as Record<string, number>,
    );

    return {
      success: true,
      stats: {
        total,
        favorites,
        thisMonth,
        byType,
      },
    };
  } catch (error) {
    console.error("QR 코드 통계 조회 실패:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "통계를 불러오는데 실패했습니다.",
    };
  }
}
