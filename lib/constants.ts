export const GITHUB_REPO_URL =
  "https://github.com/w3labkr/nextjs14-qrcode-generator";

export const COPYRIGHT_TEXT = "© 2025 W3LabKr. All rights reserved.";

// QR 코드 타입 관련 상수
export const QR_CODE_TYPES = {
  url: {
    value: "url",
    label: "URL",
    displayName: "웹사이트",
    color: "bg-blue-100 text-blue-800",
  },
  textarea: {
    value: "textarea",
    label: "TEXTAREA",
    displayName: "텍스트",
    color: "bg-gray-100 text-gray-800",
  },
  wifi: {
    value: "wifi",
    label: "WIFI",
    displayName: "Wi-Fi",
    color: "bg-green-100 text-green-800",
  },
  email: {
    value: "email",
    label: "EMAIL",
    displayName: "이메일",
    color: "bg-purple-100 text-purple-800",
  },
  sms: {
    value: "sms",
    label: "SMS",
    displayName: "문자",
    color: "bg-yellow-100 text-yellow-800",
  },
  vcard: {
    value: "vcard",
    label: "VCARD",
    displayName: "연락처",
    color: "bg-pink-100 text-pink-800",
  },
  location: {
    value: "location",
    label: "LOCATION",
    displayName: "지도",
    color: "bg-red-100 text-red-800",
  },
} as const;

export const QR_CODE_TYPE_VALUES = Object.keys(QR_CODE_TYPES) as Array<
  keyof typeof QR_CODE_TYPES
>;
