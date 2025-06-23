"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  escapeWifiString,
  validateWifiQrString,
  diagnoseWifiQrIssues,
} from "@/lib/wifi-qr-validator";
import { useQrFormStore } from "@/hooks/use-qr-form-store";
import { useState } from "react";

const wifiSchema = z.object({
  ssid: z.string().min(1, "네트워크 이름(SSID)을 입력해주세요"),
  password: z.string().default(""),
  encryption: z.string().default("WPA"),
  isHidden: z.boolean().default(false),
});

type WifiFormData = z.infer<typeof wifiSchema>;

interface WifiFormProps {
  onWifiDataChange: (data: string) => void;
  initialValue?: string;
}

export function WifiForm({ onWifiDataChange, initialValue }: WifiFormProps) {
  const { formData, updateFormData } = useQrFormStore();
  const [showPassword, setShowPassword] = useState(false);
  const [validationResult, setValidationResult] = useState<{
    isValid: boolean;
    errors: string[];
  }>({ isValid: true, errors: [] });
  const [wifiString, setWifiString] = useState("");

  const form = useForm<WifiFormData>({
    resolver: zodResolver(wifiSchema),
    defaultValues: {
      ssid: formData.wifi.ssid,
      password: formData.wifi.password,
      encryption: formData.wifi.encryption,
      isHidden: formData.wifi.isHidden,
    },
    mode: "onChange",
  });

  const parseWifiString = (wifiStr: string) => {
    const regex = /WIFI:T:([^;]*);S:([^;]*);P:([^;]*);H:([^;]*);/;
    const match = wifiStr.match(regex);

    if (match) {
      return {
        encryption: match[1] || "WPA",
        ssid: match[2] || "",
        password: match[3] || "",
        isHidden: match[4] === "true",
      };
    }
    return null;
  };

  useEffect(() => {
    if (initialValue && initialValue.startsWith("WIFI:")) {
      const parsed = parseWifiString(initialValue);
      if (parsed) {
        form.reset(parsed);
        updateFormData("wifi", parsed);
      }
    }
  }, [initialValue, form, updateFormData]);

  const generateWifiString = (data: WifiFormData): string => {
    if (!data.ssid.trim()) return "";

    const escapedSsid = escapeWifiString(data.ssid);
    const escapedPassword = escapeWifiString(data.password || "");
    const hiddenFlag = data.isHidden ? "true" : "false";

    return `WIFI:T:${data.encryption};S:${escapedSsid};P:${escapedPassword};H:${hiddenFlag};;`;
  };

  const handleFormChange = (data: WifiFormData) => {
    updateFormData("wifi", data);
    const newWifiString = generateWifiString(data);
    setWifiString(newWifiString);

    // 검증 수행
    const validation = validateWifiQrString(newWifiString);
    const issues = diagnoseWifiQrIssues(newWifiString);

    setValidationResult({
      isValid: validation.isValid && issues.length === 0,
      errors: [...validation.errors, ...issues],
    });

    onWifiDataChange(newWifiString);
  };

  useEffect(() => {
    const subscription = form.watch((data) => {
      if (data.ssid) {
        handleFormChange(data as WifiFormData);
      }
    });
    return () => subscription.unsubscribe();
  }, [form.watch, onWifiDataChange]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Wi-Fi 네트워크</CardTitle>
        <CardDescription>
          네트워크 정보를 입력하여 Wi-Fi 접속 QR 코드를 생성하세요.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <div className="grid grid-cols-1 gap-4">
            <FormField
              control={form.control}
              name="ssid"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>네트워크 이름 (SSID) *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="WiFi 네트워크 이름을 입력하세요"
                      {...field}
                    />
                  </FormControl>
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
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="WiFi 비밀번호를 입력하세요"
                        className="pr-10"
                        {...field}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute inset-y-0 right-0 px-3 py-0 hover:bg-transparent"
                        onClick={() => setShowPassword((prev) => !prev)}
                        aria-label={
                          showPassword ? "비밀번호 숨기기" : "비밀번호 보기"
                        }
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
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
                  <FormLabel>암호화 방식</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="암호화 방식 선택" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="WPA">WPA/WPA2/WPA3</SelectItem>
                      <SelectItem value="WEP">WEP (권장하지 않음)</SelectItem>
                      <SelectItem value="nopass">암호화 없음</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isHidden"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>숨겨진 네트워크</FormLabel>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 검증 결과 표시 */}
            {form.watch("ssid") && !validationResult.isValid && (
              <div>
                <Alert variant="destructive">
                  <AlertDescription>
                    <strong>WiFi QR 코드 문제가 발견되었습니다:</strong>
                    <ul className="list-disc list-inside mt-2">
                      {validationResult.errors.map((error, index) => (
                        <li key={index} className="text-sm">
                          {error}
                        </li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              </div>
            )}

            {/* 디버깅을 위한 생성된 WiFi 문자열 표시 */}
            {form.watch("ssid") && (
              <div>
                <FormLabel>생성된 WiFi QR 코드 데이터</FormLabel>
                <div className="mt-1 p-2 bg-gray-100 rounded text-sm font-mono break-all">
                  {wifiString}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  이 문자열이 QR 코드로 변환됩니다. 특수 문자가 자동으로
                  이스케이프 처리됩니다.
                  {validationResult.isValid && " ✅ 유효한 WiFi QR 코드입니다."}
                </p>
              </div>
            )}

            {/* WiFi QR 코드 사용 가이드 */}
            {form.watch("ssid") && validationResult.isValid && (
              <div>
                <Alert>
                  <AlertDescription>
                    <strong>WiFi QR 코드 연결 가이드:</strong>
                    <ol className="list-decimal list-inside mt-2 space-y-1 text-sm">
                      <li>
                        스마트폰 카메라 앱을 열거나 QR 코드 스캐너를 사용하세요
                      </li>
                      <li>QR 코드에 카메라를 향하게 하세요</li>
                      <li>화면에 나타나는 WiFi 연결 알림을 탭하세요</li>
                      <li>자동으로 네트워크에 연결됩니다</li>
                    </ol>
                  </AlertDescription>
                </Alert>
              </div>
            )}
          </div>
        </Form>
      </CardContent>
    </Card>
  );
}
