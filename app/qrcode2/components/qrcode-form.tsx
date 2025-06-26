"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFormContext, useWatch } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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

const qrcodeFormSchema = z.object({
  url: z.string(),
  text: z.string(),
  wifiSsid: z.string(),
  wifiPassword: z.string(),
  wifiWpa: z.string(),
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
});

export type QrcodeFormValues = z.infer<typeof qrcodeFormSchema>;

export function QrcodeForm() {
  const form = useForm<QrcodeFormValues>({
    resolver: zodResolver(qrcodeFormSchema),
    defaultValues: {
      url: "",
      text: "",
      wifiSsid: "",
      wifiPassword: "",
      wifiWpa: "",
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
    },
  });
  const { handleSubmit } = form;

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
          <Tabs defaultValue="url">
            <TabsList className="flex flex-row justify-start items-center overflow-x-auto">
              <TabsTrigger value="url">URL</TabsTrigger>
              <TabsTrigger value="text">텍스트</TabsTrigger>
              <TabsTrigger value="wifi">Wi-Fi</TabsTrigger>
              <TabsTrigger value="email">이메일</TabsTrigger>
              <TabsTrigger value="sms">SMS</TabsTrigger>
              <TabsTrigger value="vcard">연락처</TabsTrigger>
              <TabsTrigger value="location">지도</TabsTrigger>
            </TabsList>
            <TabsContent value="url">
              <CardUrl />
            </TabsContent>
            <TabsContent value="text">
              <CardTextarea />
            </TabsContent>
            <TabsContent value="wifi">
              <CardWifi />
            </TabsContent>
            <TabsContent value="email">
              <CardEmail />
            </TabsContent>
            <TabsContent value="sms">
              <CardSms />
            </TabsContent>
            <TabsContent value="vcard">
              <CardVCard />
            </TabsContent>
            <TabsContent value="location">
              <CardLocation />
            </TabsContent>
          </Tabs>
        </div>
        <div>
          <Card>
            <CardHeader>
              <CardTitle>QR 코드 미리보기</CardTitle>
              <CardDescription>QR 코드를 미리 볼 수 있습니다.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">
              <p>
                QR 코드는 다양한 정보를 담을 수 있습니다. 아래 버튼을 클릭하여
                QR 코드를 생성하세요.
              </p>
              <Button type="submit">QR 코드 생성</Button>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button>기본 해상도</Button>
              <Button>다운로드</Button>
            </CardFooter>
          </Card>
        </div>
      </form>
    </Form>
  );
}
