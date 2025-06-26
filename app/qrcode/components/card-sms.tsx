"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFormContext, useWatch } from "react-hook-form";
import * as z from "zod";
import { QrcodeFormValues } from "./qrcode-form";

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

export function CardSms() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>SMS</CardTitle>
        <CardDescription>전화번호와 메시지를 입력하세요.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <FieldSmsPhoneNumber />
        <FieldSmsMessage />
      </CardContent>
    </Card>
  );
}

function FieldSmsPhoneNumber() {
  const { control } = useFormContext<QrcodeFormValues>();

  return (
    <FormField
      control={control}
      name="smsPhoneNumber"
      render={({ field }) => (
        <FormItem>
          <FormLabel>
            전화번호 <span className="text-xs text-destructive">(필수)</span>
          </FormLabel>
          <FormControl>
            <Input type="tel" placeholder="010-1234-5678" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

function FieldSmsMessage() {
  const { control } = useFormContext<QrcodeFormValues>();

  return (
    <FormField
      control={control}
      name="smsMessage"
      render={({ field }) => (
        <FormItem>
          <FormLabel>
            메시지 <span className="text-xs">(선택)</span>
          </FormLabel>
          <FormControl>
            <Textarea
              placeholder="메시지를 입력하세요."
              className="min-h-[100px]"
              {...field}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
