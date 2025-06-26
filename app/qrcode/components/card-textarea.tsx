"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFormContext, useWatch } from "react-hook-form";
import { z } from "zod";
import { QrcodeFormValues } from "./qrcode-form";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

export function CardTextarea() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>일반 텍스트</CardTitle>
        <CardDescription>QR 코드에 포함할 텍스트를 입력하세요.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <FieldTextarea />
      </CardContent>
    </Card>
  );
}

function FieldTextarea() {
  const { control } = useFormContext<QrcodeFormValues>();

  return (
    <FormField
      control={control}
      name="textarea"
      render={({ field }) => (
        <FormItem>
          <FormLabel>
            텍스트 <span className="text-xs text-destructive">(필수)</span>
          </FormLabel>
          <FormControl>
            <Textarea
              placeholder="여기에 텍스트를 입력하세요."
              className="min-h-[120px] resize-none"
              {...field}
            />
          </FormControl>
          <div className="flex justify-between items-center">
            <FormDescription>
              텍스트, 숫자, 특수문자 등을 포함한 모든 내용을 QR 코드로 변환할 수
              있습니다.
            </FormDescription>
            <span className="text-xs text-muted-foreground">
              {field.value?.length || 0}/2000
            </span>
          </div>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
