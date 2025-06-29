import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getAdminEmails } from "@/lib/env-validation";

/**
 * 관리자 권한 확인 API
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ isAdmin: false });
    }

    const adminEmails = getAdminEmails();
    const isAdmin = adminEmails.includes(session.user.email);

    return NextResponse.json({ isAdmin });
  } catch (error) {
    console.error("관리자 권한 확인 실패:", error);
    return NextResponse.json({ isAdmin: false });
  }
}
