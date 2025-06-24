import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import {
  withAuthenticatedRLS,
  withAuthenticatedRLSTransaction,
} from "@/lib/rls-utils";

export const dynamic = "force-dynamic";

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

    const db = await withAuthenticatedRLS(session);

    const qrCode = await db.qrCode.findFirst({
      where: {
        id: params.id,
        userId: session.user.id, // 현재 사용자의 QR 코드만 조회
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

export async function PATCH(
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
          title: body.title,
          content: body.content,
          settings: body.settings
            ? JSON.stringify(body.settings)
            : qrCode.settings,
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
    console.error("QR 코드 수정 실패:", error);
    return NextResponse.json(
      { error: "QR 코드를 수정하는데 실패했습니다." },
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

      await tx.qrCode.delete({
        where: {
          id: params.id,
          userId: userId, // 현재 사용자의 QR 코드만 삭제
        },
      });

      return NextResponse.json({ message: "QR 코드가 삭제되었습니다." });
    });
  } catch (error) {
    console.error("QR 코드 삭제 실패:", error);
    return NextResponse.json(
      { error: "QR 코드를 삭제하는데 실패했습니다." },
      { status: 500 },
    );
  }
}
