import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { withAuthenticatedRLS } from "@/lib/rls-utils";
import { Prisma } from "@prisma/client";
import { logApiRequest, logError } from "@/lib/logging-middleware";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const session = await auth();

  try {
    if (!session?.user?.id) {
      const response = NextResponse.json(
        { error: "인증이 필요합니다." },
        { status: 401 },
      );

      // API 접근 로그 기록
      await logApiRequest(request, response, null);

      return response;
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const type = searchParams.get("type");
    const favorite = searchParams.get("favorite");
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    const skip = (page - 1) * limit;

    const db = await withAuthenticatedRLS(session);

    // 검색 조건 구성 - 명시적으로 userId 필터 추가
    const where: Prisma.QrCodeWhereInput = {
      userId: session.user.id, // 현재 사용자의 QR 코드만 조회
    };

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { content: { contains: search } },
      ];
    }

    if (type && type !== "all") {
      where.type = type;
    }

    if (favorite === "true") {
      where.isFavorite = true;
    }

    // 정렬 조건 구성
    const orderBy: Prisma.QrCodeOrderByWithRelationInput = {};
    if (sortBy === "createdAt" || sortBy === "updatedAt") {
      orderBy[sortBy] = sortOrder as "asc" | "desc";
    } else if (sortBy === "title") {
      orderBy.title = sortOrder as "asc" | "desc";
    } else if (sortBy === "type") {
      orderBy.type = sortOrder as "asc" | "desc";
    }

    // QR 코드 목록 조회
    const [qrCodes, total] = await Promise.all([
      db.qrCode.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        select: {
          id: true,
          type: true,
          title: true,
          content: true,
          settings: true,
          isFavorite: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      db.qrCode.count({ where }),
    ]);

    // settings 문자열을 JSON으로 파싱
    const formattedQrCodes = qrCodes.map((qrCode) => ({
      ...qrCode,
      settings: qrCode.settings ? JSON.parse(qrCode.settings) : {},
    }));

    const response = NextResponse.json({
      qrCodes: formattedQrCodes,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });

    // API 접근 로그 기록
    await logApiRequest(request, response, session.user.id);

    return response;
  } catch (error) {
    console.error("QR 코드 목록 조회 실패:", error);

    // 에러 로그 기록
    await logError(error as Error, session?.user?.id, {
      method: request.method,
      path: request.nextUrl.pathname,
    });

    const errorResponse = NextResponse.json(
      { error: "QR 코드 목록을 불러오는데 실패했습니다." },
      { status: 500 },
    );

    // 에러 응답도 로깅
    await logApiRequest(request, errorResponse, session?.user?.id);

    return errorResponse;
  }
}
