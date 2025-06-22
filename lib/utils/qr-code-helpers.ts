import { QrCodeType } from "@/types/qr-code-server";

export function inferQrCodeType(content: string): QrCodeType {
  if (!content || typeof content !== "string") {
    return "TEXT";
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

  return "TEXT";
}
