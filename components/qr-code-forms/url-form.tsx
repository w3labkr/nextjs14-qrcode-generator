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
import { GITHUB_REPO_URL } from "@/lib/constants";
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
      url: value || formData.url || GITHUB_REPO_URL,
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

  useEffect(() => {
    if (!value && !formData.url) {
      const defaultUrl = GITHUB_REPO_URL;
      form.setValue("url", defaultUrl);
      updateFormData("url", defaultUrl);
      onChange(defaultUrl);
    }
  }, [value, formData.url, form, updateFormData, onChange]);

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
