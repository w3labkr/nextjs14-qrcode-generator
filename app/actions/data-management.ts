"use server";

import { auth } from "@/auth";
import {
  withAuthenticatedRLS,
  withAuthenticatedRLSTransaction,
} from "@/lib/rls-utils";
import { ImportData } from "@/types/qr-code-server";
import { inferQrCodeType } from "@/lib/utils";

export async function exportUserData() {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const db = await withAuthenticatedRLS(session);

  const [qrCodes] = await Promise.all([
    db.qrCode.findMany({
      where: {
        userId: session.user.id, // 현재 사용자의 QR 코드만 조회
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
  ]);

  const exportData = {
    version: "1.0",
    exportedAt: new Date().toISOString(),
    dataType: "all",
    user: {
      id: session.user.id,
      email: session.user.email,
    },
    data: {
      qrCodes: qrCodes.map((qr: any) => ({
        ...qr,
        settings: JSON.parse(qr.settings || "{}"),
      })),
    },
    statistics: {
      totalQrCodes: qrCodes.length,
      favoriteQrCodes: qrCodes.filter((qr: any) => qr.isFavorite).length,
    },
  };

  return exportData;
}

export async function importUserData(data: ImportData) {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const { qrCodes = [], replaceExisting = false } = data;

  return await withAuthenticatedRLSTransaction(session, async (tx) => {
    // 사용자가 실제로 데이터베이스에 존재하는지 확인
    const existingUser = await tx.user.findFirst({
      where: { id: session.user!.id },
    });

    if (!existingUser) {
      throw new Error("사용자를 찾을 수 없습니다.");
    }

    let importedQrCodes = 0;

    if (replaceExisting) {
      await tx.qrCode.deleteMany({}); // RLS로 자동 필터링
    }

    if (qrCodes.length > 0) {
      for (const qrCode of qrCodes) {
        try {
          if (!qrCode.content || typeof qrCode.content !== "string") {
            console.warn("QR 코드 컨텐츠가 유효하지 않음:", qrCode);
            continue;
          }

          const validTypes = [
            "URL",
            "TEXTAREA",
            "WIFI",
            "EMAIL",
            "SMS",
            "VCARD",
            "LOCATION",
          ];
          let qrType = qrCode.type;

          if (!qrType || !validTypes.includes(qrType.toUpperCase())) {
            qrType = inferQrCodeType(qrCode.content);
          }

          await tx.qrCode.create({
            data: {
              userId: session.user!.id,
              type: qrType,
              title: qrCode.title || null,
              content: qrCode.content,
              settings:
                typeof qrCode.settings === "string"
                  ? qrCode.settings
                  : JSON.stringify(qrCode.settings || {}),
              isFavorite: Boolean(qrCode.isFavorite),
            },
          });
          importedQrCodes++;
        } catch (error) {
          console.error("QR 코드 가져오기 오류:", error);
        }
      }
    }

    return {
      success: true,
      imported: {
        qrCodes: importedQrCodes,
      },
      total: {
        qrCodes: qrCodes.length,
      },
    };
  });
}
