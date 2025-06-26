"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFormContext, useWatch } from "react-hook-form";
import * as z from "zod";
import { QrcodeFormValues } from "./qrcode-form";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

export function CardWifi() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Wi-Fi 네트워크</CardTitle>
        <CardDescription>
          QR 코드에 포함할 Wi-Fi 네트워크 정보를 입력하세요.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <FieldWifiSsid />
        <FieldWifiPassword />
        <FieldWifiEncryption />
        <FieldWifiIsHidden />
        {/* WiFi QR 코드 사용 가이드 */}
        <Alert>
          <AlertDescription>
            <strong>WiFi QR 코드 연결 가이드:</strong>
            <ol className="list-decimal list-inside mt-2 space-y-1 text-sm">
              <li>스마트폰 카메라 앱을 열거나 QR 코드 스캐너를 사용하세요</li>
              <li>QR 코드를 스캔하면 WiFi 연결 알림이 나타납니다</li>
              <li>알림을 탭하여 자동으로 WiFi에 연결하세요</li>
              <li>연결이 되지 않으면 WiFi 설정에서 수동으로 확인해보세요</li>
            </ol>
            <p className="text-xs text-gray-600 mt-2">
              일부 구형 기기는 WiFi QR 코드를 지원하지 않을 수 있습니다.
            </p>
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}

function FieldWifiSsid() {
  const { control } = useFormContext<QrcodeFormValues>();

  return (
    <FormField
      control={control}
      name="wifiSsid"
      render={({ field }) => (
        <FormItem>
          <FormLabel>
            네트워크 이름 (SSID){" "}
            <span className="text-xs text-destructive">(필수)</span>
          </FormLabel>
          <FormControl>
            <Input placeholder="Wi-Fi 네트워크 이름을 입력하세요." {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

function FieldWifiPassword() {
  const { control } = useFormContext<QrcodeFormValues>();

  return (
    <FormField
      control={control}
      name="wifiPassword"
      render={({ field }) => (
        <FormItem>
          <FormLabel>
            비밀번호 <span className="text-xs text-destructive">(필수)</span>
          </FormLabel>
          <FormControl>
            <Input
              type="password"
              placeholder="Wi-Fi 비밀번호를 입력하세요."
              {...field}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

function FieldWifiEncryption() {
  const { control } = useFormContext<QrcodeFormValues>();

  return (
    <FormField
      control={control}
      name="wifiEncryption"
      render={({ field }) => (
        <FormItem>
          <FormLabel>암호화 방식</FormLabel>
          <Select onValueChange={field.onChange} defaultValue={field.value}>
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="암호화 방식을 선택하세요" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectItem value="WPA">WPA</SelectItem>
              <SelectItem value="WEP">WEP</SelectItem>
              <SelectItem value="nopass">암호 없음</SelectItem>
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

function FieldWifiIsHidden() {
  const { control } = useFormContext<QrcodeFormValues>();

  return (
    <FormField
      control={control}
      name="wifiIsHidden"
      render={({ field }) => (
        <FormItem className="flex items-center gap-2">
          <FormControl>
            <Checkbox id="isHidden" />
          </FormControl>
          <Label htmlFor="isHidden" className="!mt-0.5">
            숨겨진 네트워크
          </Label>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
