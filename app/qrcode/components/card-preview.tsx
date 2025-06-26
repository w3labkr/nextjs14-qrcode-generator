"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFormContext, useWatch } from "react-hook-form";
import { z } from "zod";
import { QrcodeFormValues } from "./qrcode-form";

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
  const { control } = useFormContext<QrcodeFormValues>();

  return (
    <Card>
      <CardHeader>
        <CardTitle>QR 코드 미리보기</CardTitle>
        <CardDescription>
          QR 코드는 다양한 정보를 담을 수 있습니다. 아래 버튼을 클릭하여 QR
          코드를 생성하세요.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-4">
        <div className="w-64 h-64 bg-gray-100 rounded-lg flex items-center justify-center">
          <p className="text-muted-foreground">생성 버튼을 눌러주세요</p>
        </div>
        <Button type="submit" className="w-full">
          QR 코드 생성
        </Button>
      </CardContent>
      <CardFooter className="flex gap-2">
        <FieldPreviewExportFormat />
        <Button type="button" className="w-full" disabled>
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
