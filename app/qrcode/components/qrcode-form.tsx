"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFormContext, useWatch } from "react-hook-form";
import { z } from "zod";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  qrType: z.enum(["url", "text", "wifi", "email", "sms", "vcard", "location"]),
  url: z
    .string()
    .url("올바른 URL 형식을 입력해주세요. (예: https://example.com)"),
  textarea: z
    .string()
    .min(1, "텍스트를 입력해주세요.")
    .max(2000, "텍스트는 2000자 이하로 입력해주세요."),
  wifiSsid: z.string(),
  wifiPassword: z.string(),
  wifiEncryption: z.enum(["WPA", "WEP", "nopass"]),
  wifiIsHidden: z.boolean(),
  smsPhoneNumber: z.string(),
  smsMessage: z.string(),
  emailAddress: z.string(),
  emailSubject: z.string(),
  emailBody: z.string(),
  location: z.string(),
  vcardFullName: z.string(),
  vcardPhoneNumber: z.string(),
  vcardEmail: z.string(),
  vcardOrganization: z.string(),
  vcardJobTitle: z.string(),
  vcardWebsite: z.string(),
  vcardAddress: z.string(),
  styleForegroundColor: z.string(),
  styleBackgroundColor: z.string(),
  styleBorderStyle: z.string(),
  styleText: z.string(),
  styleTextColor: z.string(),
  styleBorderColor: z.string(),
  styleLogo: z.string(),
  previewExportFormat: z.string(),
});

export type QrcodeFormValues = z.infer<typeof qrcodeFormSchema>;

const defaultValues: QrcodeFormValues = {
  qrType: "url" as const,
  url: "https://example.com",
  textarea: "안녕하세요! 이것은 QR 코드로 변환될 텍스트입니다.",
  wifiSsid: "",
  wifiPassword: "",
  wifiEncryption: "WPA", // WPA, WEP, nopass
  wifiIsHidden: false,
  smsPhoneNumber: "",
  smsMessage: "",
  emailAddress: "",
  emailSubject: "",
  emailBody: "",
  location: "",
  vcardFullName: "",
  vcardPhoneNumber: "",
  vcardEmail: "",
  vcardOrganization: "",
  vcardJobTitle: "",
  vcardWebsite: "",
  vcardAddress: "",
  styleForegroundColor: "#000000",
  styleBackgroundColor: "#ffffff",
  styleBorderStyle: "none", // none, simple, rounded, custom
  styleText: "",
  styleTextColor: "#000000",
  styleBorderColor: "#000000",
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
            <TabsList className="flex flex-row justify-start items-center overflow-x-auto">
              <TabsTrigger value="url">URL</TabsTrigger>
              <TabsTrigger value="text">텍스트</TabsTrigger>
              <TabsTrigger value="wifi">Wi-Fi</TabsTrigger>
              <TabsTrigger value="email">이메일</TabsTrigger>
              <TabsTrigger value="sms">SMS</TabsTrigger>
              <TabsTrigger value="vcard">연락처</TabsTrigger>
              <TabsTrigger value="location">지도</TabsTrigger>
            </TabsList>
            <TabsContent value="url" className="space-y-4">
              <CardUrl />
              <CardStyle />
            </TabsContent>
            <TabsContent value="text" className="space-y-4">
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
