import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

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

    const qrCode = await prisma.qrCode.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    });

    if (!qrCode) {
      return NextResponse.json(
        { error: "QR 코드를 찾을 수 없습니다." },
        { status: 404 },
      );
    }

    const updatedQrCode = await prisma.qrCode.update({
      where: { id: params.id },
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
  } catch (error) {
    console.error("즐겨찾기 토글 실패:", error);
    return NextResponse.json(
      { error: "즐겨찾기 설정에 실패했습니다." },
      { status: 500 },
    );
  }
}
