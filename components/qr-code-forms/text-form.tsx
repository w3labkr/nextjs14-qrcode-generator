"use client";

import { useEffect, useCallback, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { debounce } from "lodash";
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
import { useQrFormStore } from "@/hooks/use-qr-form-store";

const textSchema = z.object({
  text: z.string().min(1, "텍스트를 입력해주세요"),
});

type TextFormData = z.infer<typeof textSchema>;

interface TextFormProps {
  value: string;
  onChange: (value: string) => void;
}

export function TextForm({ value, onChange }: TextFormProps) {
  const { formData, updateFormData } = useQrFormStore();

  const form = useForm<TextFormData>({
    resolver: zodResolver(textSchema),
    defaultValues: {
      text: value || formData.text,
    },
    mode: "onChange",
  });

  // debounce된 onChange 함수 생성
  const debouncedOnChange = useMemo(
    () =>
      debounce((text: string) => {
        updateFormData("text", text);
        onChange(text);
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
    if (value !== undefined && value !== form.getValues("text")) {
      form.setValue("text", value);
      if (value) {
        updateFormData("text", value);
      }
    }
  }, [value, form, updateFormData]);

  // 스토어의 데이터로 폼 초기화
  useEffect(() => {
    if (formData.text && formData.text !== form.getValues("text")) {
      form.setValue("text", formData.text);
    }
  }, [formData.text, form]);

  useEffect(() => {
    const subscription = form.watch((data) => {
      if (data.text !== undefined) {
        debouncedOnChange(data.text);
      }
    });
    return () => {
      subscription.unsubscribe();
      debouncedOnChange.cancel();
    };
  }, [form.watch, debouncedOnChange]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>일반 텍스트</CardTitle>
        <CardDescription>
          공유하고 싶은 텍스트를 자유롭게 입력하세요.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <FormField
            control={form.control}
            name="text"
            render={({ field }) => (
              <FormItem>
                <FormLabel>텍스트</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="여기에 텍스트를 입력하세요"
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
