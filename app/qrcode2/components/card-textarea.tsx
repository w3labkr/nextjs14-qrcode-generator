"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFormContext, useWatch } from "react-hook-form";
import { z } from "zod";
import { QrcodeFormValues } from "./qrcode-form";

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

export function CardTextarea() {
  const { control } = useFormContext<QrcodeFormValues>();

  return (
    <Card>
      <CardHeader>
        <CardTitle>일반 텍스트</CardTitle>
        <CardDescription>QR 코드에 포함할 텍스트를 입력하세요.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormField
          control={control}
          name="text"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                텍스트 <span className="text-xs text-destructive">(필수)</span>
              </FormLabel>
              <FormControl>
                <Textarea
                  placeholder="여기에 텍스트를 입력하세요."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );
}
