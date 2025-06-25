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

export function CardWifi() {
  const { control } = useFormContext();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Wi-Fi 네트워크</CardTitle>
        <CardDescription>
          QR 코드에 포함할 Wi-Fi 네트워크 정보를 입력하세요.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6">
        <FormField
          control={control}
          name="wifi_ssid"
          render={({ field }) => (
            <FormItem>
              <FormLabel>네트워크 이름 (SSID)</FormLabel>
              <FormControl>
                <Input
                  placeholder="Wi-Fi 네트워크 이름을 입력하세요."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="wifi_password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>비밀번호</FormLabel>
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
        <FormField
          control={control}
          name="wifi_wpa"
          render={({ field }) => (
            <FormItem>
              <FormLabel>암호화 방식</FormLabel>
              <FormControl>
                <Input
                  placeholder="Wi-Fi 암호화 방식을 입력하세요"
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
