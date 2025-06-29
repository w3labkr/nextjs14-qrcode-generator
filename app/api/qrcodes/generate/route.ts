import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { generateQrCode } from "@/app/actions/qr-code-generator";
import { withAuthenticatedApiLogging } from "@/lib/api-logging";

export const dynamic = "force-dynamic";

const handlePOST = async (request: NextRequest) => {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { settings } = body;

    if (!settings) {
      return NextResponse.json(
        { error: "QR 코드 설정이 필요합니다." },
        { status: 400 },
      );
    }

    const qrCodeDataUrl = await generateQrCode(settings);

    return NextResponse.json({
      success: true,
      dataUrl: qrCodeDataUrl,
    });
  } catch (error) {
    console.error("QR 코드 생성 오류:", error);
    return NextResponse.json(
      { error: "QR 코드 생성에 실패했습니다." },
      { status: 500 },
    );
  }
};

export const POST = withAuthenticatedApiLogging(handlePOST);
