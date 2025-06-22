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

// QR 코드 업데이트
export async function updateQrCode(
  qrCodeId: string,
  options: QrCodeOptions & {
    title?: string;
    qrType: "URL" | "TEXT" | "WIFI" | "EMAIL" | "SMS" | "VCARD" | "LOCATION";
  },
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    // 기존 QR 코드 확인
    const existingQrCode = await prisma.qrCode.findFirst({
      where: {
        id: qrCodeId,
        userId: session.user.id,
      },
    });

    if (!existingQrCode) {
      return { success: false, error: "QR Code not found" };
    }

    // 새로운 QR 코드 생성
    const qrCodeDataUrl = await generateQrCode(options);

    // 데이터베이스 업데이트
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

// 데이터 내보내기/가져오기 액션들

// 사용자 데이터 내보내기 (QR 코드 + 템플릿)
export async function exportUserData() {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const [qrCodes, templates] = await Promise.all([
    prisma.qrCode.findMany({
      where: {
        userId: session.user.id,
      },
      select: {
        type: true,
        title: true,
        content: true,
        settings: true,
        isFavorite: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    }),
    prisma.qrTemplate.findMany({
      where: {
        userId: session.user.id,
      },
      select: {
        name: true,
        settings: true,
        isDefault: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    }),
  ]);

  const exportData = {
    version: "1.0",
    exportedAt: new Date().toISOString(),
    user: {
      name: session.user.name,
      email: session.user.email,
    },
    qrCodes: qrCodes.map((qr) => ({
      ...qr,
      settings: JSON.parse(qr.settings),
    })),
    templates: templates.map((template) => ({
      ...template,
      settings: JSON.parse(template.settings),
    })),
    stats: {
      totalQrCodes: qrCodes.length,
      totalTemplates: templates.length,
      favoriteQrCodes: qrCodes.filter((qr) => qr.isFavorite).length,
      defaultTemplates: templates.filter((t) => t.isDefault).length,
    },
  };

  return exportData;
}

// 데이터 가져오기 (기존 데이터에 추가)
export async function importUserData(data: {
  qrCodes?: Array<{
    type: string;
    title?: string;
    content: string;
    settings: any;
    isFavorite?: boolean;
  }>;
  templates?: Array<{
    name: string;
    settings: any;
    isDefault?: boolean;
  }>;
  replaceExisting?: boolean;
}) {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const { qrCodes = [], templates = [], replaceExisting = false } = data;

  try {
    let importedQrCodes = 0;
    let importedTemplates = 0;

    // 기존 데이터 삭제 (replaceExisting이 true인 경우)
    if (replaceExisting) {
      await Promise.all([
        prisma.qrCode.deleteMany({
          where: { userId: session.user.id },
        }),
        prisma.qrTemplate.deleteMany({
          where: { userId: session.user.id },
        }),
      ]);
    }

    // QR 코드 가져오기
    if (qrCodes.length > 0) {
      for (const qrCode of qrCodes) {
        try {
          await prisma.qrCode.create({
            data: {
              userId: session.user.id,
              type: qrCode.type,
              title: qrCode.title || null,
              content: qrCode.content,
              settings: JSON.stringify(qrCode.settings),
              isFavorite: qrCode.isFavorite || false,
            },
          });
          importedQrCodes++;
        } catch (error) {
          console.error("QR 코드 가져오기 오류:", error);
          // 개별 오류는 무시하고 계속 진행
        }
      }
    }

    // 템플릿 가져오기
    if (templates.length > 0) {
      // 기본 템플릿이 여러 개인 경우 첫 번째만 기본으로 설정
      let hasDefaultTemplate = false;

      for (const template of templates) {
        try {
          const isDefault = template.isDefault && !hasDefaultTemplate;

          // 기본 템플릿으로 설정하는 경우, 기존 기본 템플릿 해제
          if (isDefault && !replaceExisting) {
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

          await prisma.qrTemplate.create({
            data: {
              userId: session.user.id,
              name: template.name,
              settings: JSON.stringify(template.settings),
              isDefault,
            },
          });

          if (isDefault) {
            hasDefaultTemplate = true;
          }

          importedTemplates++;
        } catch (error) {
          console.error("템플릿 가져오기 오류:", error);
          // 개별 오류는 무시하고 계속 진행
        }
      }
    }

    return {
      success: true,
      imported: {
        qrCodes: importedQrCodes,
        templates: importedTemplates,
      },
      total: {
        qrCodes: qrCodes.length,
        templates: templates.length,
      },
    };
  } catch (error) {
    console.error("데이터 가져오기 오류:", error);
    throw new Error("데이터 가져오기에 실패했습니다.");
  }
}

// 계정 삭제
export async function deleteAccount() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      throw new Error("로그인이 필요합니다.");
    }

    const userId = session.user.id;

    // 사용자 존재 확인
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        _count: {
          select: {
            qrCodes: true,
            templates: true,
            accounts: true,
            sessions: true,
          },
        },
      },
    });

    if (!user) {
      throw new Error("사용자를 찾을 수 없습니다.");
    }

    // 트랜잭션으로 모든 데이터 삭제
    await prisma.$transaction(async (tx) => {
      // 1. QR 코드 삭제
      const deletedQrCodes = await tx.qrCode.deleteMany({
        where: { userId },
      });

      // 2. QR 템플릿 삭제
      const deletedTemplates = await tx.qrTemplate.deleteMany({
        where: { userId },
      });

      // 3. 세션 삭제
      const deletedSessions = await tx.session.deleteMany({
        where: { userId },
      });

      // 4. 계정 삭제
      const deletedAccounts = await tx.account.deleteMany({
        where: { userId },
      });

      // 5. 사용자 삭제 (마지막에)
      await tx.user.delete({
        where: { id: userId },
      });

      console.log("계정 삭제 완료:", {
        userId,
        userEmail: user.email,
        deletedQrCodes: deletedQrCodes.count,
        deletedTemplates: deletedTemplates.count,
        deletedSessions: deletedSessions.count,
        deletedAccounts: deletedAccounts.count,
      });
    });

    return {
      success: true,
      message: "계정과 모든 관련 데이터가 성공적으로 삭제되었습니다.",
    };
  } catch (error) {
    console.error("계정 삭제 오류:", error);
    throw new Error(
      error instanceof Error ? error.message : "계정 삭제에 실패했습니다.",
    );
  }
}

// QR 코드 저장 관련 타입 정의
export interface SaveQrCodeData {
  type: string;
  title?: string;
  content: string;
  settings: any;
}

// QR 코드를 데이터베이스에 저장
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

// QR 코드 통계 조회
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
