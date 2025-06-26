"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFormContext, useWatch } from "react-hook-form";
import { z } from "zod";
import { QrcodeFormValues } from "./qrcode-form";

import { Input } from "@/components/ui/input";
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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

export function CardLocation() {
  const { control } = useFormContext<QrcodeFormValues>();

  return (
    <Card>
      <CardHeader>
        <CardTitle>위치 정보</CardTitle>
        <CardDescription>
          지도로 연결할 주소나 장소명을 입력하세요.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormField
          control={control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                주소 <span className="text-xs text-destructive">(필수)</span>
              </FormLabel>
              <FormControl>
                <Input placeholder="서울특별시 종로구 청와대로 1" {...field} />
              </FormControl>
              <FormDescription>
                정확한 주소나 장소명을 입력하거나 검색 버튼을 클릭하여 다음
                우편번호 서비스로 주소를 찾으세요.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );
}
