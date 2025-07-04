import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { QrCodeType } from "@/types/qr-code-server";
import { QR_CODE_TYPES } from "@/lib/constants";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * 현재 세션에서 사용자를 확인하고, 데이터베이스에 없으면 생성합니다.
 * 개발 모드에서 유용합니다.
 */
export async function ensureUserExists() {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("로그인이 필요합니다.");
  }

  // 사용자가 실제로 데이터베이스에 존재하는지 확인
  let existingUser = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (!existingUser) {
    // 개발 모드나 새로운 사용자의 경우 자동 생성
    existingUser = await prisma.user.create({
      data: {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        image: session.user.image,
      },
    });
  }

  return { user: existingUser, session };
}

export function inferQrCodeType(content: string): QrCodeType {
  if (!content || typeof content !== "string") {
    return "TEXTAREA";
  }

  const trimmedContent = content.trim().toLowerCase();

  if (trimmedContent.match(/^https?:\/\//)) {
    return "URL";
  }

  if (trimmedContent.match(/^mailto:/)) {
    return "EMAIL";
  }

  if (trimmedContent.match(/^sms:/)) {
    return "SMS";
  }

  if (trimmedContent.match(/^wifi:/)) {
    return "WIFI";
  }

  if (
    trimmedContent.includes("begin:vcard") ||
    trimmedContent.includes("end:vcard")
  ) {
    return "VCARD";
  }

  if (trimmedContent.match(/^geo:/)) {
    return "LOCATION";
  }

  return "TEXTAREA";
}

/**
 * 텍스트를 지정된 길이로 자르고 생략표를 추가합니다.
 * @param content - 자를 텍스트
 * @param maxLength - 최대 길이 (기본값: 80)
 * @returns 잘린 텍스트
 */
export function truncateContent(
  content: string,
  maxLength: number = 80,
): string {
  if (content.length <= maxLength) return content;
  return content.substring(0, maxLength) + "...";
}

/**
 * QR 코드 타입의 표시명을 반환합니다.
 * @param type - QR 코드 타입 (예: "URL", "TEXTAREA", "WIFI" 등)
 * @returns 타입의 한국어 표시명
 */
export function getTypeLabel(type: string): string {
  // 타입 정규화: 데이터베이스의 "TEXT"를 "TEXTAREA"로 매핑
  const normalizedType =
    type.toUpperCase() === "TEXT" ? "TEXTAREA" : type.toUpperCase();

  // QR_CODE_TYPES에서 해당 타입의 displayName을 찾기
  const qrCodeType = Object.values(QR_CODE_TYPES).find(
    (qrType) => qrType.label === normalizedType,
  );
  return qrCodeType?.displayName || type;
}

/**
 * QR 코드 타입의 색상 클래스를 반환합니다.
 * @param type - QR 코드 타입 (예: "URL", "TEXTAREA", "WIFI" 등)
 * @returns 타입의 색상 클래스
 */
export function getTypeColor(type: string): string {
  // 타입 정규화: 데이터베이스의 "TEXT"를 "TEXTAREA"로 매핑
  const normalizedType =
    type.toUpperCase() === "TEXT" ? "TEXTAREA" : type.toUpperCase();

  // QR_CODE_TYPES에서 해당 타입의 color를 찾기
  const qrCodeType = Object.values(QR_CODE_TYPES).find(
    (qrType) => qrType.label === normalizedType,
  );

  return qrCodeType?.color || "bg-gray-100 text-gray-800";
}

/**
 * QR 코드 내용의 미리보기 텍스트를 생성합니다.
 * @param content - QR 코드 내용
 * @param type - QR 코드 타입
 * @returns 미리보기 텍스트
 */
export function getContentPreview(content: string, type: string): string {
  if (!content || typeof content !== "string") return "내용 없음";

  if (type === "WIFI") {
    try {
      const wifiData = JSON.parse(content);
      return `SSID: ${wifiData.ssid || "알 수 없음"}`;
    } catch {
      return content.substring(0, 50) + "...";
    }
  }
  return content.length > 50 ? content.substring(0, 50) + "..." : content;
}

/**
 * QR 코드 설정에서 색상을 추출합니다.
 * @param settings - QR 코드 설정 객체
 * @returns 추출된 색상 (기본값: #6b7280)
 */
export function getQrCodeColor(settings: any): string {
  try {
    let parsedSettings = settings;

    // settings가 문자열인 경우 파싱
    if (typeof settings === "string") {
      try {
        parsedSettings = JSON.parse(settings);
      } catch {
        return "#6b7280"; // 파싱 실패시 기본 회색
      }
    }

    // 다양한 형태의 전경색 설정 확인
    if (parsedSettings?.color?.dark) {
      return parsedSettings.color.dark;
    }
    if (parsedSettings?.foregroundColor) {
      return parsedSettings.foregroundColor;
    }
  } catch {
    // settings 파싱에 실패한 경우 기본 색상 반환
  }
  return "#6b7280"; // 기본 회색
}
