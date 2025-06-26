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

export function CardEmail() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>이메일</CardTitle>
        <CardDescription>
          이메일 주소와 제목, 내용을 입력하세요.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <FieldEmailAddress />
        <FieldEmailSubject />
        <FieldEmailBody />
      </CardContent>
    </Card>
  );
}

function FieldEmailAddress() {
  const { control } = useFormContext<QrcodeFormValues>();

  return (
    <FormField
      control={control}
      name="emailAddress"
      render={({ field }) => (
        <FormItem>
          <FormLabel>
            이메일 주소 <span className="text-xs text-destructive">(필수)</span>
          </FormLabel>
          <FormControl>
            <Input type="email" placeholder="me@example.com" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

function FieldEmailSubject() {
  const { control } = useFormContext<QrcodeFormValues>();

  return (
    <FormField
      control={control}
      name="emailSubject"
      render={({ field }) => (
        <FormItem>
          <FormLabel>
            제목 <span className="text-xs">(선택)</span>
          </FormLabel>
          <FormControl>
            <Input placeholder="제목을 입력하세요." {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

function FieldEmailBody() {
  const { control } = useFormContext<QrcodeFormValues>();

  return (
    <FormField
      control={control}
      name="emailBody"
      render={({ field }) => (
        <FormItem>
          <FormLabel>
            내용 <span className="text-xs">(선택)</span>
          </FormLabel>
          <FormControl>
            <Textarea
              placeholder="내용을 입력하세요."
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
