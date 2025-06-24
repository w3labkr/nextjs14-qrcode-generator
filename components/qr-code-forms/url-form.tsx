"use client";

import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { debounce } from "lodash";
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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useQrFormStore } from "@/hooks/use-qr-form-store";

const urlSchema = z.object({
  url: z.string().url("올바른 URL을 입력해주세요").min(1, "URL을 입력해주세요"),
});

type UrlFormData = z.infer<typeof urlSchema>;

interface UrlFormProps {
  value: string;
  onChange: (value: string) => void;
}

export function UrlForm({ value, onChange }: UrlFormProps) {
  const { formData, updateFormData } = useQrFormStore();

  const form = useForm<UrlFormData>({
    resolver: zodResolver(urlSchema),
    defaultValues: {
      url: value || formData.url || "",
    },
    mode: "onChange",
  });

  // debounce된 onChange 함수 생성
  const debouncedOnChange = useMemo(
    () =>
      debounce((url: string) => {
        updateFormData("url", url);
        onChange(url);
      }, 300),
    [updateFormData, onChange],
  );

  // 컴포넌트 언마운트 시 debounce 취소
  useEffect(() => {
    return () => {
      debouncedOnChange.cancel();
    };
  }, [debouncedOnChange]);

  // value prop이 변경될 때 폼 값 업데이트
  useEffect(() => {
    if (value !== undefined && value !== form.getValues("url")) {
      form.setValue("url", value);
      if (value) {
        updateFormData("url", value);
      }
    }
  }, [value, form, updateFormData]);

  // 스토어의 데이터로 폼 초기화
  useEffect(() => {
    if (formData.url && formData.url !== form.getValues("url")) {
      form.setValue("url", formData.url);
    }
  }, [formData.url, form]);

  useEffect(() => {
    const subscription = form.watch((data) => {
      if (data.url && form.formState.isValid) {
        debouncedOnChange(data.url);
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
        <CardTitle>웹사이트 URL</CardTitle>
        <CardDescription>연결할 웹사이트 주소를 입력하세요.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <FormField
            control={form.control}
            name="url"
            render={({ field }) => (
              <FormItem>
                <FormLabel>URL</FormLabel>
                <FormControl>
                  <Input
                    type="url"
                    placeholder="https://example.com"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </Form>
      </CardContent>
    </Card>
  );
}
