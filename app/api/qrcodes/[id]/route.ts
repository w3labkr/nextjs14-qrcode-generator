import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

interface Params {
  id: string;
}

export async function GET(
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

    return NextResponse.json({
      ...qrCode,
      settings: qrCode.settings ? JSON.parse(qrCode.settings) : {},
    });
  } catch (error) {
    console.error("QR 코드 조회 실패:", error);
    return NextResponse.json(
      { error: "QR 코드를 불러오는데 실패했습니다." },
      { status: 500 },
    );
  }
}

export async function PUT(
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

    const body = await request.json();
    const { title, isFavorite } = body;

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
        title,
        isFavorite,
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
    console.error("QR 코드 업데이트 실패:", error);
    return NextResponse.json(
      { error: "QR 코드 업데이트에 실패했습니다." },
      { status: 500 },
    );
  }
}

export async function DELETE(
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

    await prisma.qrCode.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("QR 코드 삭제 실패:", error);
    return NextResponse.json(
      { error: "QR 코드 삭제에 실패했습니다." },
      { status: 500 },
    );
  }
}
