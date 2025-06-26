"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFormContext, useWatch } from "react-hook-form";
import { z } from "zod";
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
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

export function CardUrl() {
  const { control } = useFormContext<QrcodeFormValues>();

  return (
    <Card>
      <CardHeader>
        <CardTitle>웹사이트 URL</CardTitle>
        <CardDescription>연결할 웹사이트 주소를 입력하세요.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <FieldUrl />
      </CardContent>
    </Card>
  );
}

function FieldUrl() {
  const { control } = useFormContext<QrcodeFormValues>();

  return (
    <FormField
      control={control}
      name="url"
      render={({ field }) => (
        <FormItem>
          <FormLabel>
            URL <span className="text-xs text-destructive">(필수)</span>
          </FormLabel>
          <FormControl>
            <Input placeholder="https://example.com" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
