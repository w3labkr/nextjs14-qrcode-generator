"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFormContext, useWatch } from "react-hook-form";
import { z } from "zod";
import { QrcodeFormValues, qrcodeFormSchema } from "./qrcode-form";
import { useState, useCallback } from "react";
import { generateQrCode } from "@/app/actions/qr-code-generator";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

export function CardPreview() {
  const { control, getValues, setError, clearErrors } =
    useFormContext<QrcodeFormValues>();
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [generalError, setGeneralError] = useState<string>("");

  // 내보내기 포맷만 실시간 감지 (다운로드용)
  const exportFormat = useWatch({ control, name: "previewExportFormat" });

  // QR 코드 생성 함수 (버튼 클릭시에만 실행)
  const handleGenerateQrCode = useCallback(async () => {
    const values = getValues();
    const qrType = values.qrType;
    let text = "";
    let hasValidationError = false;

    // 모든 필드 오류 초기화
    clearErrors();
    setGeneralError("");

    // QR 타입에 따라 텍스트와 유효성 검사 결정
    switch (qrType) {
      case "url":
        text = values.url;
        const urlValidation = qrcodeFormSchema.shape.url.safeParse(values.url);
        if (!urlValidation.success) {
          setError("url", { message: urlValidation.error.errors[0].message });
          hasValidationError = true;
        }
        break;
      case "text":
        text = values.textarea;
        const textValidation = qrcodeFormSchema.shape.textarea.safeParse(
          values.textarea,
        );
        if (!textValidation.success) {
          setError("textarea", {
            message: textValidation.error.errors[0].message,
          });
          hasValidationError = true;
        }
        break;
      case "wifi":
        // Wi-Fi 필수 필드 검사
        const ssidValidation = qrcodeFormSchema.shape.wifiSsid.safeParse(
          values.wifiSsid,
        );
        const passwordValidation =
          qrcodeFormSchema.shape.wifiPassword.safeParse(values.wifiPassword);

        if (!ssidValidation.success) {
          setError("wifiSsid", {
            message: ssidValidation.error.errors[0].message,
          });
          hasValidationError = true;
        }
        if (!passwordValidation.success) {
          setError("wifiPassword", {
            message: passwordValidation.error.errors[0].message,
          });
          hasValidationError = true;
        }

        // Wi-Fi QR 코드 형식: WIFI:T:WPA;S:MyNetwork;P:MyPassword;H:false;;
        text = `WIFI:T:${values.wifiEncryption};S:${values.wifiSsid};P:${values.wifiPassword};H:${values.wifiIsHidden ? "true" : "false"};;`;
        break;
      case "email":
        // 이메일 필수 필드 검사
        const emailValidation = qrcodeFormSchema.shape.emailAddress.safeParse(
          values.emailAddress,
        );
        if (!emailValidation.success) {
          setError("emailAddress", {
            message: emailValidation.error.errors[0].message,
          });
          hasValidationError = true;
        }

        // 이메일 QR 코드 형식: mailto:email@example.com?subject=Subject&body=Body
        text = `mailto:${values.emailAddress}?subject=${encodeURIComponent(values.emailSubject)}&body=${encodeURIComponent(values.emailBody)}`;
        break;
      case "sms":
        // SMS 필수 필드 검사
        const phoneValidation = qrcodeFormSchema.shape.smsPhoneNumber.safeParse(
          values.smsPhoneNumber,
        );
        if (!phoneValidation.success) {
          setError("smsPhoneNumber", {
            message: phoneValidation.error.errors[0].message,
          });
          hasValidationError = true;
        }

        // SMS QR 코드 형식: sms:+1234567890?body=Message
        text = `sms:${values.smsPhoneNumber}?body=${encodeURIComponent(values.smsMessage)}`;
        break;
      case "vcard":
        // 연락처 필수 필드 검사
        const nameValidation = qrcodeFormSchema.shape.vcardFullName.safeParse(
          values.vcardFullName,
        );
        if (!nameValidation.success) {
          setError("vcardFullName", {
            message: nameValidation.error.errors[0].message,
          });
          hasValidationError = true;
        }

        // vCard QR 코드 형식
        text = `BEGIN:VCARD
VERSION:3.0
FN:${values.vcardFullName}
TEL:${values.vcardPhoneNumber}
EMAIL:${values.vcardEmail}
ORG:${values.vcardOrganization}
TITLE:${values.vcardJobTitle}
URL:${values.vcardWebsite}
ADR:;;${values.vcardAddress};;;;
END:VCARD`;
        break;
      case "location":
        // 위치 필수 필드 검사
        const locationValidation = qrcodeFormSchema.shape.location.safeParse(
          values.location,
        );
        if (!locationValidation.success) {
          setError("location", {
            message: locationValidation.error.errors[0].message,
          });
          hasValidationError = true;
        }

        // 위치 QR 코드 형식: geo:latitude,longitude
        text = values.location;
        break;
      default:
        text = values.url;
        const defaultUrlValidation = qrcodeFormSchema.shape.url.safeParse(
          values.url,
        );
        if (!defaultUrlValidation.success) {
          setError("url", {
            message: defaultUrlValidation.error.errors[0].message,
          });
          hasValidationError = true;
        }
    }

    // 유효성 검사 오류가 있으면 중단
    if (hasValidationError) {
      setQrCodeUrl("");
      return;
    }

    if (!text || text.trim().length === 0) {
      setGeneralError("내용을 입력해주세요.");
      setQrCodeUrl("");
      return;
    }

    setIsLoading(true);
    setGeneralError("");

    try {
      const result = await generateQrCode({
        text: text,
        type: (values.previewExportFormat || "png") as "png" | "svg" | "jpg",
        width: 256,
        color: {
          dark: values.styleForegroundColor || "#000000",
          light: values.styleBackgroundColor || "#ffffff",
        },
      });

      setQrCodeUrl(result);
    } catch (err) {
      console.error("QR 코드 생성 오류:", err);
      setGeneralError("QR 코드 생성에 실패했습니다.");
      setQrCodeUrl("");
    } finally {
      setIsLoading(false);
    }
  }, [getValues, setError, clearErrors]);

  // 다운로드 함수
  const handleDownload = useCallback(() => {
    if (!qrCodeUrl) return;

    const link = document.createElement("a");
    link.href = qrCodeUrl;
    link.download = `qrcode_${Date.now()}.${exportFormat || "png"}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [qrCodeUrl, exportFormat]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>QR 코드 미리보기</CardTitle>
        <CardDescription>
          "QR 코드 저장" 버튼을 클릭하면 QR 코드가 생성됩니다.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-4">
        <div className="w-64 h-64 bg-gray-100 rounded-lg flex items-center justify-center">
          {isLoading ? (
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary">
              &nbsp;
            </div>
          ) : generalError ? (
            <div className="text-center text-sm text-red-500 p-4">
              <p>{generalError}</p>
            </div>
          ) : qrCodeUrl ? (
            <img
              src={qrCodeUrl}
              alt="Generated QR Code"
              className="max-w-full max-h-full object-contain"
            />
          ) : (
            <p className="text-muted-foreground text-center">
              "QR 코드 저장" 버튼을 클릭하여
              <br />
              QR 코드를 생성하세요
            </p>
          )}
        </div>
        <Button
          type="button"
          className="w-full"
          disabled={isLoading}
          onClick={handleGenerateQrCode}
        >
          {isLoading ? "생성 중..." : "QR 코드 저장"}
        </Button>
      </CardContent>
      <CardFooter className="flex gap-2">
        <FieldPreviewExportFormat />
        <Button
          type="button"
          className="w-full"
          disabled={!qrCodeUrl || isLoading}
          onClick={handleDownload}
        >
          다운로드
        </Button>
      </CardFooter>
    </Card>
  );
}

function FieldPreviewExportFormat() {
  const { control } = useFormContext<QrcodeFormValues>();

  return (
    <FormField
      control={control}
      name="previewExportFormat"
      render={({ field }) => (
        <FormItem className="w-full">
          <Select onValueChange={field.onChange} defaultValue={field.value}>
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="포맷 선택" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectItem value="png">PNG (기본 해상도)</SelectItem>
              <SelectItem value="svg">SVG (벡터)</SelectItem>
              <SelectItem value="jpg">JPG (기본 해상도)</SelectItem>
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
