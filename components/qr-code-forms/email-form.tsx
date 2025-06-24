"use client";

import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { debounce } from "lodash";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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

const emailSchema = z.object({
  email: z
    .string()
    .email("올바른 이메일 주소를 입력해주세요")
    .min(1, "이메일 주소를 입력해주세요"),
  subject: z.string().optional(),
  body: z.string().optional(),
});

type EmailFormData = z.infer<typeof emailSchema>;

interface EmailFormProps {
  onChange: (emailString: string) => void;
  initialValue?: string;
}

export function EmailForm({ onChange, initialValue }: EmailFormProps) {
  const { formData, updateFormData } = useQrFormStore();

  const form = useForm<EmailFormData>({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      email: formData.email.email,
      subject: formData.email.subject,
      body: formData.email.body,
    },
    mode: "onChange",
  });

  const parseEmailString = (emailStr: string) => {
    const mailtoMatch = emailStr.match(/^mailto:([^?]+)/);
    if (!mailtoMatch) return null;

    const email = mailtoMatch[1];
    const url = new URL(emailStr);
    const subject = url.searchParams.get("subject") || "";
    const body = url.searchParams.get("body") || "";

    return { email, subject, body };
  };

  useEffect(() => {
    if (initialValue && initialValue.startsWith("mailto:")) {
      const parsed = parseEmailString(initialValue);
      if (parsed) {
        form.reset(parsed);
        updateFormData("email", parsed);
      }
    } else if (!initialValue) {
      // initialValue가 비어있으면 폼 초기화
      form.reset({ email: "", subject: "", body: "" });
      updateFormData("email", { email: "", subject: "", body: "" });
    }
  }, [initialValue, form, updateFormData]);

  const generateEmailString = (data: EmailFormData): string => {
    if (!data.email) return "";

    let emailString = `mailto:${data.email}`;
    const params: string[] = [];

    if (data.subject)
      params.push(`subject=${encodeURIComponent(data.subject)}`);
    if (data.body) params.push(`body=${encodeURIComponent(data.body)}`);

    if (params.length > 0) {
      emailString += `?${params.join("&")}`;
    }

    return emailString;
  };

  const handleFormChange = (data: EmailFormData) => {
    updateFormData("email", data);
    const emailString = generateEmailString(data);
    onChange(emailString);
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
      if (data.email) {
        debouncedHandleFormChange(data as EmailFormData);
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
        <CardTitle>이메일</CardTitle>
        <CardDescription>
          이메일 주소와 제목, 내용을 설정하여 이메일 앱을 자동으로 실행하는 QR
          코드를 생성하세요.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <div className="grid grid-cols-1 gap-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>이메일 주소 *</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="example@example.com"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="subject"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>제목 (선택사항)</FormLabel>
                  <FormControl>
                    <Input placeholder="이메일 제목을 입력하세요" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="body"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>내용 (선택사항)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="이메일 내용을 입력하세요"
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
