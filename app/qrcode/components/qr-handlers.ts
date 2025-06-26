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
