"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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

const smsSchema = z.object({
  phoneNumber: z
    .string()
    .min(1, "전화번호를 입력해주세요")
    .regex(/^[+]?[0-9\s\-()]+$/, "올바른 전화번호를 입력해주세요"),
  message: z.string().optional(),
});

type SmsFormData = z.infer<typeof smsSchema>;

interface SmsFormProps {
  onChange: (data: string) => void;
}

export function SmsForm({ onChange }: SmsFormProps) {
  const form = useForm<SmsFormData>({
    resolver: zodResolver(smsSchema),
    defaultValues: {
      phoneNumber: "",
      message: "",
    },
    mode: "onChange",
  });

  // QR 콘텐츠 생성 함수
  const generateSmsContent = (data: SmsFormData) => {
    if (!data.phoneNumber) return "";

    let smsString = `sms:${data.phoneNumber}`;
    if (data.message) {
      smsString += `?body=${encodeURIComponent(data.message)}`;
    }

    return smsString;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>SMS</CardTitle>
        <CardDescription>전화번호와 메시지를 입력하세요.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="phoneNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>전화번호 *</FormLabel>
                  <FormControl>
                    <Input type="tel" placeholder="010-1234-5678" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>메시지</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="SMS 메시지 (선택)"
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
