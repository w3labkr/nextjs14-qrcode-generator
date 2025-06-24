import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { withAuthenticatedRLSTransaction } from "@/lib/rls-utils";

export const dynamic = "force-dynamic";

interface Params {
  id: string;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Params },
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "인증이 필요합니다." },
        { status: 401 },
      );
    }

    const userId = session.user.id; // 타입 안전성을 위해 미리 추출

    return await withAuthenticatedRLSTransaction(session, async (tx) => {
      const qrCode = await tx.qrCode.findFirst({
        where: {
          id: params.id,
          userId: userId, // 현재 사용자의 QR 코드만 조회
        },
      });

      if (!qrCode) {
        return NextResponse.json(
          { error: "QR 코드를 찾을 수 없습니다." },
          { status: 404 },
        );
      }

      const updatedQrCode = await tx.qrCode.update({
        where: {
          id: params.id,
          userId: userId, // 현재 사용자의 QR 코드만 수정
        },
        data: {
          isFavorite: !qrCode.isFavorite,
          updatedAt: new Date(),
        },
      });

      return NextResponse.json({
        ...updatedQrCode,
        settings: updatedQrCode.settings
          ? JSON.parse(updatedQrCode.settings)
          : {},
      });
    });
  } catch (error) {
    console.error("즐겨찾기 토글 실패:", error);
    return NextResponse.json(
      { error: "즐겨찾기 설정에 실패했습니다." },
      { status: 500 },
    );
  }
}
