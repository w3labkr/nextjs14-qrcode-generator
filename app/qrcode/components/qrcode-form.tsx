"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFormContext, useWatch } from "react-hook-form";
import * as z from "zod";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { CardWifi } from "./card-wifi";
import { CardTextarea } from "./card-textarea";
import { CardUrl } from "./card-url";
import { CardEmail } from "./card-email";
import { CardSms } from "./card-sms";
import { CardVCard } from "./card-vcard";
import { CardLocation } from "./card-location";
import { CardStyle } from "./card-style";
import { CardPreview } from "./card-preview";

export const qrcodeFormSchema = z.object({
  qrType: z.enum([
    "url",
    "textarea",
    "wifi",
    "email",
    "sms",
    "vcard",
    "location",
  ]),
  url: z.string().url("올바른 URL 형식을 입력해주세요."),
  textarea: z
    .string()
    .min(1, "텍스트를 입력해주세요.")
    .max(2000, "텍스트는 2000자 이하로 입력해주세요."),
  wifiSsid: z.string().min(1, "Wi-Fi 네트워크 이름(SSID)을 입력해주세요."),
  wifiPassword: z.string().min(1, "Wi-Fi 비밀번호를 입력해주세요."),
  wifiEncryption: z.enum(["WPA", "WEP", "nopass"]),
  wifiIsHidden: z.boolean(),
  smsPhoneNumber: z
    .string()
    .min(1, "전화번호를 입력해주세요.")
    .regex(/^[\d\-\+\(\)\s]+$/, "올바른 전화번호 형식을 입력해주세요."),
  smsMessage: z.string(),
  emailAddress: z
    .string()
    .min(1, "이메일 주소를 입력해주세요.")
    .email("올바른 이메일 형식을 입력해주세요."),
  emailSubject: z.string(),
  emailBody: z.string(),
  location: z.string().min(1, "주소를 입력해주세요."),
  vcardFullName: z.string().min(1, "이름을 입력해주세요."),
  vcardPhoneNumber: z.string(),
  vcardEmail: z.string().email("올바른 이메일 형식을 입력해주세요.").optional(),
  vcardOrganization: z.string(),
  vcardJobTitle: z.string(),
  vcardWebsite: z.string().url("올바른 URL 형식을 입력해주세요.").optional(),
  vcardAddress: z.string(),
  styleForegroundColor: z.string(),
  styleBackgroundColor: z.string(),
  styleBorderStyle: z.string(),
  styleText: z.string(),
  styleTextColor: z.string(),
  styleBorderColor: z.string(),
  styleBorderRadius: z.number().min(0).max(50),
  styleBorderWidth: z.number().min(1).max(20),
  styleFontSize: z.number().min(8).max(48),
  styleLogo: z.string(),
  previewExportFormat: z.string(),
});

export type QrcodeFormValues = z.infer<typeof qrcodeFormSchema>;

const defaultValues: QrcodeFormValues = {
  qrType: "url" as const,
  url: "https://example.com",
  textarea: "안녕하세요! 이것은 QR 코드로 변환될 텍스트입니다.",
  wifiSsid: "MyWiFi",
  wifiPassword: "password123",
  wifiEncryption: "WPA", // WPA, WEP, nopass
  wifiIsHidden: false,
  smsPhoneNumber: "010-1234-5678",
  smsMessage: "안녕하세요!",
  emailAddress: "example@email.com",
  emailSubject: "제목",
  emailBody: "메일 내용",
  location: "서울시 강남구 테헤란로 427",
  vcardFullName: "홍길동",
  vcardPhoneNumber: "",
  vcardEmail: "",
  vcardOrganization: "",
  vcardJobTitle: "",
  vcardWebsite: "",
  vcardAddress: "",
  styleForegroundColor: "#000000",
  styleBackgroundColor: "#ffffff",
  styleBorderStyle: "none", // none, simple, rounded, custom
  styleText: "스캔해주세요",
  styleTextColor: "#000000",
  styleBorderColor: "#000000",
  styleBorderRadius: 16,
  styleBorderWidth: 2,
  styleFontSize: 16,
  styleLogo: "",
  previewExportFormat: "png", // jpg, png, svg
};

export function QrcodeForm() {
  const form = useForm<QrcodeFormValues>({
    resolver: zodResolver(qrcodeFormSchema),
    defaultValues,
  });
  const { handleSubmit, setValue, watch } = form;
  const qrType = watch("qrType");

  function onSubmit(values: QrcodeFormValues) {
    console.log(values);
  }

  return (
    <Form {...form}>
      <form
        noValidate
        onSubmit={handleSubmit(onSubmit)}
        className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-4xl mx-auto"
      >
        <div>
          <Tabs
            value={qrType}
            onValueChange={(value) => setValue("qrType", value as any)}
          >
            <ScrollArea className="w-full whitespace-nowrap">
              <TabsList className="inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground w-full">
                <TabsTrigger value="url">URL</TabsTrigger>
                <TabsTrigger value="textarea">텍스트</TabsTrigger>
                <TabsTrigger value="wifi">Wi-Fi</TabsTrigger>
                <TabsTrigger value="email">이메일</TabsTrigger>
                <TabsTrigger value="sms">SMS</TabsTrigger>
                <TabsTrigger value="vcard">연락처</TabsTrigger>
                <TabsTrigger value="location">지도</TabsTrigger>
              </TabsList>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
            <TabsContent value="url" className="space-y-4">
              <CardUrl />
              <CardStyle />
            </TabsContent>
            <TabsContent value="textarea" className="space-y-4">
              <CardTextarea />
              <CardStyle />
            </TabsContent>
            <TabsContent value="wifi" className="space-y-4">
              <CardWifi />
              <CardStyle />
            </TabsContent>
            <TabsContent value="email" className="space-y-4">
              <CardEmail />
              <CardStyle />
            </TabsContent>
            <TabsContent value="sms" className="space-y-4">
              <CardSms />
              <CardStyle />
            </TabsContent>
            <TabsContent value="vcard" className="space-y-4">
              <CardVCard />
              <CardStyle />
            </TabsContent>
            <TabsContent value="location" className="space-y-4">
              <CardLocation />
              <CardStyle />
            </TabsContent>
          </Tabs>
        </div>
        <div>
          <CardPreview />
        </div>
      </form>
    </Form>
  );
}
