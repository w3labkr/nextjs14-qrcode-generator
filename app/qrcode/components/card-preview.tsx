"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFormContext, useWatch } from "react-hook-form";
import * as z from "zod";
import { QrcodeFormValues, qrcodeFormSchema } from "./qrcode-form";
import { useState, useCallback, useEffect } from "react";
import { toast } from "sonner";
import { generateQrCode } from "@/app/actions/qr-code-generator";
import { saveQrCode } from "@/app/actions/qr-code-management";
import { getQrHandler, handleQrDownload } from "./qr-handlers";
import { useSession } from "next-auth/react";

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
  const [qrCode, setQrCode] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { data: session, status } = useSession();
  const isAuthenticated = !!session?.user;

  // 내보내기 포맷만 실시간 감지 (다운로드용)
  const exportFormat = useWatch({ control, name: "previewExportFormat" });

  // QR 코드 생성 함수 (버튼 클릭시에만 실행)
  const handleGenerateQrCode = useCallback(async () => {
    const values = getValues();

    // 모든 필드 오류 초기화
    clearErrors();

    // QR 타입별 핸들러로 텍스트 생성 및 유효성 검사
    const handler = getQrHandler(values.qrType);
    const result = handler({ values, setError });

    // 유효성 검사 오류가 있으면 중단
    if (result.hasError) {
      setQrCode("");
      return;
    }

    if (!result.text || result.text.trim().length === 0) {
      toast.error("내용을 입력해주세요.");
      setQrCode("");
      return;
    }

    setIsLoading(true);

    try {
      const qrResult = await generateQrCode({
        text: result.text,
        type: (values.previewExportFormat || "png") as "png" | "svg" | "jpg",
        width: 256,
        color: {
          dark: values.styleForegroundColor || "#000000",
          light: values.styleBackgroundColor || "#ffffff",
        },
        logo: values.styleLogo || undefined,
        frameOptions:
          values.styleBorderStyle !== "none"
            ? {
                type: values.styleBorderStyle || "simple",
                text: values.styleText || "",
                textColor: values.styleTextColor || "#000000",
                backgroundColor: values.styleBackgroundColor || "#ffffff",
                borderColor: values.styleBorderColor || "#000000",
                borderWidth: values.styleBorderWidth || 2,
                borderRadius: values.styleBorderRadius || 8,
                fontSize: values.styleFontSize || 16,
              }
            : undefined,
      });

      setQrCode(qrResult);

      // 로그인한 사용자만 데이터베이스에 저장
      if (isAuthenticated) {
        const saveResult = await saveQrCode({
          type: values.qrType,
          content: result.text,
          settings: {
            color: {
              dark: values.styleForegroundColor || "#000000",
              light: values.styleBackgroundColor || "#ffffff",
            },
            width: 256,
            logo: values.styleLogo || undefined,
            frameOptions:
              values.styleBorderStyle !== "none"
                ? {
                    type: values.styleBorderStyle || "simple",
                    text: values.styleText || "",
                    textColor: values.styleTextColor || "#000000",
                    backgroundColor: values.styleBackgroundColor || "#ffffff",
                    borderColor: values.styleBorderColor || "#000000",
                    borderWidth: values.styleBorderWidth || 2,
                    borderRadius: values.styleBorderRadius || 8,
                    fontSize: values.styleFontSize || 16,
                  }
                : undefined,
          },
        });

        if (saveResult.success) {
          toast.success("QR 코드가 성공적으로 저장되었습니다!");
        } else {
          toast.error(saveResult.error || "QR 코드 저장에 실패했습니다.");
        }
      } else {
        toast.success(
          "QR 코드가 생성되었습니다! 로그인하시면 QR 코드를 저장할 수 있습니다.",
        );
      }
    } catch (err) {
      console.error("QR 코드 생성 오류:", err);
      toast.error("QR 코드 생성에 실패했습니다.");
      setQrCode("");
    } finally {
      setIsLoading(false);
    }
  }, [getValues, setError, clearErrors, isAuthenticated]);

  // 다운로드 함수
  const handleDownload = useCallback(() => {
    if (!qrCode) return;
    handleQrDownload(qrCode, exportFormat || "png");
  }, [qrCode, exportFormat]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>QR 코드 미리보기</CardTitle>
        <CardDescription>
          {isAuthenticated
            ? '"QR 코드 저장" 버튼을 클릭하면 QR 코드가 생성되고 저장됩니다.'
            : '"QR 코드 생성" 버튼을 클릭하면 QR 코드가 생성됩니다. 로그인하시면 QR 코드를 저장할 수 있습니다.'}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-4">
        <div className="w-64 h-64 bg-gray-100 p-4 rounded-lg flex items-center justify-center">
          {isLoading ? (
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary">
              &nbsp;
            </div>
          ) : qrCode ? (
            <img
              src={qrCode}
              alt="Generated QR Code"
              className="max-w-full max-h-full object-contain"
            />
          ) : (
            <p className="text-muted-foreground text-center">
              {isAuthenticated
                ? '"QR 코드 저장" 버튼을 클릭하여\nQR 코드를 생성하고 저장하세요'
                : '"QR 코드 생성" 버튼을 클릭하여\nQR 코드를 생성하세요'}
            </p>
          )}
        </div>
        <Button
          type="button"
          className="w-full"
          disabled={isLoading}
          onClick={handleGenerateQrCode}
        >
          {isLoading
            ? "생성 중..."
            : isAuthenticated
              ? "QR 코드 저장"
              : "QR 코드 생성"}
        </Button>
      </CardContent>
      <CardFooter className="flex gap-2">
        <FieldPreviewExportFormat />
        <Button
          type="button"
          className="w-full"
          disabled={!qrCode || isLoading}
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
