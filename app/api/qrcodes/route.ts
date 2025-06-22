import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "인증이 필요합니다." },
        { status: 401 },
      );
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

    // 검색 조건 구성
    const where: Prisma.QrCodeWhereInput = {
      userId: session.user.id,
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
      prisma.qrCode.findMany({
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
      prisma.qrCode.count({ where }),
    ]);

    // settings 문자열을 JSON으로 파싱
    const formattedQrCodes = qrCodes.map((qrCode) => ({
      ...qrCode,
      settings: qrCode.settings ? JSON.parse(qrCode.settings) : {},
    }));

    return NextResponse.json({
      qrCodes: formattedQrCodes,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("QR 코드 목록 조회 실패:", error);
    return NextResponse.json(
      { error: "QR 코드 목록을 불러오는데 실패했습니다." },
      { status: 500 },
    );
  }
}
