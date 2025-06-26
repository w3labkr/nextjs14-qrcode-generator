"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFormContext, useWatch } from "react-hook-form";
import { z } from "zod";
import { QrcodeFormValues, qrcodeFormSchema } from "./qrcode-form";
import { useState, useCallback } from "react";
import { generateQrCode } from "@/app/actions/qr-code-generator";
import { getQrHandler } from "./qr-handlers";

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

    // 모든 필드 오류 초기화
    clearErrors();
    setGeneralError("");

    // QR 타입별 핸들러로 텍스트 생성 및 유효성 검사
    const handler = getQrHandler(values.qrType);
    const result = handler({ values, setError });

    // 유효성 검사 오류가 있으면 중단
    if (result.hasError) {
      setQrCodeUrl("");
      return;
    }

    if (!result.text || result.text.trim().length === 0) {
      setGeneralError("내용을 입력해주세요.");
      setQrCodeUrl("");
      return;
    }

    setIsLoading(true);
    setGeneralError("");

    try {
      const qrResult = await generateQrCode({
        text: result.text,
        type: (values.previewExportFormat || "png") as "png" | "svg" | "jpg",
        width: 256,
        color: {
          dark: values.styleForegroundColor || "#000000",
          light: values.styleBackgroundColor || "#ffffff",
        },
      });

      setQrCodeUrl(qrResult);
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
