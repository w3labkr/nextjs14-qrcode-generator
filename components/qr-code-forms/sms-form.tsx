"use client";

import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { debounce } from "lodash";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useQrFormStore } from "@/hooks/use-qr-form-store";

const smsSchema = z.object({
  phoneNumber: z.string().min(1, "전화번호를 입력해주세요"),
  message: z.string().optional(),
});

type SmsFormData = z.infer<typeof smsSchema>;

interface SmsFormProps {
  onChange: () => void;
  initialValue?: string;
}

export function SmsForm({ onChange, initialValue }: SmsFormProps) {
  const { formData, updateFormData } = useQrFormStore();

  const form = useForm<SmsFormData>({
    resolver: zodResolver(smsSchema),
    defaultValues: {
      phoneNumber: formData.sms.phoneNumber,
      message: formData.sms.message,
    },
    mode: "onChange",
  });

  const parseSmsString = (smsStr: string) => {
    const smsMatch = smsStr.match(/^sms:([^?]+)/);
    if (!smsMatch) return null;

    const phoneNumber = smsMatch[1];
    const url = new URL(smsStr);
    const message = url.searchParams.get("body") || "";

    return { phoneNumber, message };
  };

  useEffect(() => {
    if (initialValue && initialValue.startsWith("sms:")) {
      const parsed = parseSmsString(initialValue);
      if (parsed) {
        form.reset(parsed);
        updateFormData("sms", parsed);
      }
    } else if (!initialValue) {
      // initialValue가 비어있으면 폼 초기화
      form.reset({ phoneNumber: "", message: "" });
      updateFormData("sms", { phoneNumber: "", message: "" });
    }
  }, [initialValue, form, updateFormData]);

  const generateSmsString = (data: SmsFormData): string => {
    if (!data.phoneNumber) return "";

    let smsString = `sms:${data.phoneNumber}`;
    if (data.message) {
      smsString += `?body=${encodeURIComponent(data.message)}`;
    }

    return smsString;
  };

  const handleFormChange = (data: SmsFormData) => {
    updateFormData("sms", data);
    const smsString = generateSmsString(data);
    onChange();
  };

  // debounce된 onChange 함수 생성
  const debouncedHandleFormChange = useMemo(
    () => debounce(handleFormChange, 300),
    [updateFormData, onChange],
  );

  // 컴포넌트 언마운트 시 debounce 취소
  useEffect(() => {
    return () => {
      debouncedHandleFormChange.cancel();
    };
  }, [debouncedHandleFormChange]);

  useEffect(() => {
    const subscription = form.watch((data) => {
      if (data.phoneNumber) {
        debouncedHandleFormChange(data as SmsFormData);
      }
    });
    return () => {
      subscription.unsubscribe();
      debouncedHandleFormChange.cancel();
    };
  }, [form.watch, debouncedHandleFormChange]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>SMS/문자</CardTitle>
        <CardDescription>
          전화번호와 메시지 내용을 설정하여 문자 앱을 자동으로 실행하는 QR
          코드를 생성하세요.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <div className="grid grid-cols-1 gap-4">
            <FormField
              control={form.control}
              name="phoneNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>전화번호 *</FormLabel>
                  <FormControl>
                    <Input
                      type="tel"
                      placeholder="010-1234-5678 또는 +821012345678"
                      {...field}
                    />
                  </FormControl>
                  <p className="text-xs text-muted-foreground">
                    국가 코드를 포함하여 입력하면 더 정확합니다 (예:
                    +82-10-1234-5678)
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>메시지 (선택사항)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="미리 입력할 문자 메시지를 작성하세요"
                      rows={4}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </Form>
      </CardContent>
    </Card>
  );
}
