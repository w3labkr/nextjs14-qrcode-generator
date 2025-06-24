"use client";

import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { debounce } from "lodash";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const wifiSchema = z.object({
  ssid: z.string().min(1, "네트워크 이름을 입력해주세요"),
  password: z.string().optional(),
  encryption: z.enum(["WPA", "WEP", "nopass"]),
  isHidden: z.boolean(),
});

type WifiFormData = z.infer<typeof wifiSchema>;

interface WifiFormProps {
  onWifiDataChange: (data: string) => void;
}

export function WifiForm({ onWifiDataChange }: WifiFormProps) {
  const form = useForm<WifiFormData>({
    resolver: zodResolver(wifiSchema),
    defaultValues: {
      ssid: "",
      password: "",
      encryption: "WPA",
      isHidden: false,
    },
    mode: "onChange",
  });

  // QR 콘텐츠 생성 함수
  const generateWifiContent = (data: WifiFormData) => {
    if (!data.ssid) return "";

    const escapedSsid = data.ssid.replace(/[\\";,]/g, "\\$&");
    const escapedPassword = data.password?.replace(/[\\";,]/g, "\\$&") || "";
    const hiddenFlag = data.isHidden ? "true" : "false";

    return `WIFI:T:${data.encryption};S:${escapedSsid};P:${escapedPassword};H:${hiddenFlag};;`;
  };

  // debounce된 onChange 함수 생성
  const debouncedOnChange = useMemo(
    () =>
      debounce((data: WifiFormData) => {
        const content = generateWifiContent(data);
        onWifiDataChange(content);
      }, 300),
    [onWifiDataChange],
  );

  // 컴포넌트 언마운트 시 debounce 취소
  useEffect(() => {
    return () => {
      debouncedOnChange.cancel();
    };
  }, [debouncedOnChange]);

  useEffect(() => {
    const subscription = form.watch((data) => {
      if (data.ssid && form.formState.isValid) {
        debouncedOnChange(data as WifiFormData);
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
        <CardTitle>Wi-Fi 네트워크</CardTitle>
        <CardDescription>Wi-Fi 네트워크 정보를 입력하세요.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="ssid"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>네트워크 이름 (SSID) *</FormLabel>
                  <FormControl>
                    <Input placeholder="Wi-Fi 네트워크 이름" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="encryption"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>보안 유형</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="보안 유형을 선택하세요" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="WPA">WPA/WPA2</SelectItem>
                      <SelectItem value="WEP">WEP</SelectItem>
                      <SelectItem value="nopass">보안 없음</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>비밀번호</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Wi-Fi 비밀번호"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="isHidden"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">숨겨진 네트워크</FormLabel>
                    <div className="text-sm text-muted-foreground">
                      네트워크가 숨겨져 있는 경우 활성화하세요
                    </div>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        </Form>
      </CardContent>
    </Card>
  );
}
