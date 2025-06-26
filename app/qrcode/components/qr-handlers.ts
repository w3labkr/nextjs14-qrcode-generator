import { QrcodeFormValues, qrcodeFormSchema } from "./qrcode-form";
import { UseFormSetError } from "react-hook-form";

export interface QrHandlerResult {
  text: string;
  hasError: boolean;
}

export interface QrHandlerParams {
  values: QrcodeFormValues;
  setError: UseFormSetError<QrcodeFormValues>;
}

export const handleUrlQr = ({
  values,
  setError,
}: QrHandlerParams): QrHandlerResult => {
  const validation = qrcodeFormSchema.shape.url.safeParse(values.url);

  if (!validation.success) {
    setError("url", { message: validation.error.errors[0].message });
    return { text: "", hasError: true };
  }

  return { text: values.url, hasError: false };
};

export const handleTextQr = ({
  values,
  setError,
}: QrHandlerParams): QrHandlerResult => {
  const validation = qrcodeFormSchema.shape.textarea.safeParse(values.textarea);

  if (!validation.success) {
    setError("textarea", { message: validation.error.errors[0].message });
    return { text: "", hasError: true };
  }

  return { text: values.textarea, hasError: false };
};

export const handleWifiQr = ({
  values,
  setError,
}: QrHandlerParams): QrHandlerResult => {
  let hasError = false;

  const ssidValidation = qrcodeFormSchema.shape.wifiSsid.safeParse(
    values.wifiSsid,
  );
  const passwordValidation = qrcodeFormSchema.shape.wifiPassword.safeParse(
    values.wifiPassword,
  );

  if (!ssidValidation.success) {
    setError("wifiSsid", { message: ssidValidation.error.errors[0].message });
    hasError = true;
  }

  if (!passwordValidation.success) {
    setError("wifiPassword", {
      message: passwordValidation.error.errors[0].message,
    });
    hasError = true;
  }

  if (hasError) {
    return { text: "", hasError: true };
  }

  const text = `WIFI:T:${values.wifiEncryption};S:${values.wifiSsid};P:${values.wifiPassword};H:${values.wifiIsHidden ? "true" : "false"};;`;
  return { text, hasError: false };
};

export const handleEmailQr = ({
  values,
  setError,
}: QrHandlerParams): QrHandlerResult => {
  const validation = qrcodeFormSchema.shape.emailAddress.safeParse(
    values.emailAddress,
  );

  if (!validation.success) {
    setError("emailAddress", { message: validation.error.errors[0].message });
    return { text: "", hasError: true };
  }

  const text = `mailto:${values.emailAddress}?subject=${encodeURIComponent(values.emailSubject)}&body=${encodeURIComponent(values.emailBody)}`;
  return { text, hasError: false };
};

export const handleSmsQr = ({
  values,
  setError,
}: QrHandlerParams): QrHandlerResult => {
  const validation = qrcodeFormSchema.shape.smsPhoneNumber.safeParse(
    values.smsPhoneNumber,
  );

  if (!validation.success) {
    setError("smsPhoneNumber", { message: validation.error.errors[0].message });
    return { text: "", hasError: true };
  }

  const text = `sms:${values.smsPhoneNumber}?body=${encodeURIComponent(values.smsMessage)}`;
  return { text, hasError: false };
};

export const handleVcardQr = ({
  values,
  setError,
}: QrHandlerParams): QrHandlerResult => {
  const validation = qrcodeFormSchema.shape.vcardFullName.safeParse(
    values.vcardFullName,
  );

  if (!validation.success) {
    setError("vcardFullName", { message: validation.error.errors[0].message });
    return { text: "", hasError: true };
  }

  const text = `BEGIN:VCARD
VERSION:3.0
FN:${values.vcardFullName}
TEL:${values.vcardPhoneNumber}
EMAIL:${values.vcardEmail}
ORG:${values.vcardOrganization}
TITLE:${values.vcardJobTitle}
URL:${values.vcardWebsite}
ADR:;;${values.vcardAddress};;;;
END:VCARD`;

  return { text, hasError: false };
};

export const handleLocationQr = ({
  values,
  setError,
}: QrHandlerParams): QrHandlerResult => {
  const validation = qrcodeFormSchema.shape.location.safeParse(values.location);

  if (!validation.success) {
    setError("location", { message: validation.error.errors[0].message });
    return { text: "", hasError: true };
  }

  return { text: values.location, hasError: false };
};

export const getQrHandler = (qrType: string) => {
  const handlers = {
    url: handleUrlQr,
    text: handleTextQr,
    wifi: handleWifiQr,
    email: handleEmailQr,
    sms: handleSmsQr,
    vcard: handleVcardQr,
    location: handleLocationQr,
  };

  return handlers[qrType as keyof typeof handlers] || handleUrlQr;
};

// QR 코드 다운로드 함수
export const handleQrDownload = (qrCodeUrl: string, format: string): void => {
  if (!qrCodeUrl) return;

  // SVG 파일의 경우 특별한 처리가 필요
  if (format === "svg") {
    // SVG 데이터가 base64 data URL 형태인지 확인
    if (qrCodeUrl.startsWith("data:image/svg+xml;base64,")) {
      // base64 디코딩하여 SVG 문자열로 변환 후 Blob 생성
      const base64Data = qrCodeUrl.split(",")[1];
      const svgString = atob(base64Data);
      const svgBlob = new Blob([svgString], {
        type: "image/svg+xml;charset=utf-8",
      });
      const svgUrl = URL.createObjectURL(svgBlob);
      downloadFile(svgUrl, format, true);
    } else if (qrCodeUrl.startsWith("data:image/svg+xml")) {
      // 일반 SVG data URL인 경우 그대로 사용
      downloadFile(qrCodeUrl, format);
    } else {
      // SVG 문자열인 경우 Blob으로 변환
      const svgBlob = new Blob([qrCodeUrl], {
        type: "image/svg+xml;charset=utf-8",
      });
      const svgUrl = URL.createObjectURL(svgBlob);
      downloadFile(svgUrl, format, true);
    }
  } else {
    // PNG, JPG의 경우 기본 처리
    downloadFile(qrCodeUrl, format);
  }
};

const downloadFile = (
  url: string,
  format: string,
  isObjectUrl = false,
): void => {
  const link = document.createElement("a");
  link.href = url;
  link.download = `qrcode_${Date.now()}.${format}`;

  // SVG의 경우 적절한 속성 설정
  if (format === "svg") {
    link.setAttribute("type", "image/svg+xml");
  }

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Object URL인 경우 메모리 해제
  if (isObjectUrl) {
    URL.revokeObjectURL(url);
  }
};
