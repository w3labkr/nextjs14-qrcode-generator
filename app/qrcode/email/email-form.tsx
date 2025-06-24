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
  onChange: (data: string) => void;
}

export function EmailForm({ onChange }: EmailFormProps) {
  const form = useForm<EmailFormData>({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      email: "",
      subject: "",
      body: "",
    },
    mode: "onChange",
  });

  // QR 콘텐츠 생성 함수
  const generateEmailContent = (data: EmailFormData) => {
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

  // debounce된 onChange 함수 생성
  const debouncedOnChange = useMemo(
    () =>
      debounce((data: EmailFormData) => {
        const content = generateEmailContent(data);
        onChange(content);
      }, 300),
    [onChange],
  );

  // 컴포넌트 언마운트 시 debounce 취소
  useEffect(() => {
    return () => {
      debouncedOnChange.cancel();
    };
  }, [debouncedOnChange]);

  useEffect(() => {
    const subscription = form.watch((data) => {
      if (data.email && form.formState.isValid) {
        debouncedOnChange(data as EmailFormData);
      }
    });
    return () => {
      subscription.unsubscribe();
      debouncedOnChange.cancel();
    };
  }, [form.watch, debouncedOnChange, form.formState.isValid]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>이메일</CardTitle>
        <CardDescription>
          이메일 주소와 제목, 내용을 입력하세요.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>이메일 주소 *</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="example@domain.com"
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
                  <FormLabel>제목</FormLabel>
                  <FormControl>
                    <Input placeholder="이메일 제목 (선택)" {...field} />
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
                  <FormLabel>내용</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="이메일 내용 (선택)"
                      className="min-h-[100px]"
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
