"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFormContext } from "react-hook-form";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

import { CardWifi } from "./components/card-wifi";
import { CardText } from "./components/card-text";
import { CardUrl } from "./components/card-url";

const formSchema = z.object({
  url: z.string(),
  text: z.string(),
  wifi_ssid: z.string(),
  wifi_password: z.string(),
  wifi_wpa: z.string(),
});

export default function QrCodePage2() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      url: "",
      text: "",
      wifi_ssid: "",
      wifi_password: "",
      wifi_wpa: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-4xl mx-auto"
      >
        <div>
          <Tabs defaultValue="url">
            <TabsList>
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
              <CardText />
            </TabsContent>
            <TabsContent value="wifi">
              <CardWifi />
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
