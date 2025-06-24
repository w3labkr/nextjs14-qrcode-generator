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

const locationSchema = z.object({
  address: z.string().min(1, "주소를 입력해주세요"),
});

type LocationFormData = z.infer<typeof locationSchema>;

interface LocationFormProps {
  onChange: (data: string) => void;
}

export function LocationForm({ onChange }: LocationFormProps) {
  const form = useForm<LocationFormData>({
    resolver: zodResolver(locationSchema),
    defaultValues: {
      address: "",
    },
    mode: "onChange",
  });

  // QR 콘텐츠 생성 함수
  const generateLocationContent = (data: LocationFormData) => {
    if (!data.address) return "";

    const encodedAddress = encodeURIComponent(data.address);
    return `https://maps.google.com/?q=${encodedAddress}`;
  };

  // debounce된 onChange 함수 생성
  const debouncedOnChange = useMemo(
    () =>
      debounce((data: LocationFormData) => {
        const content = generateLocationContent(data);
        onChange(content);
      }, 300),
    [onChange],
  );

  // 컴포넌트 언마운트 시 debounce 취소
  useEffect(() => {
    return () => {
      debouncedOnChange.cancel();
    };
  }, [debouncedOnChange]);

  useEffect(() => {
    const subscription = form.watch((data) => {
      if (data.address && form.formState.isValid) {
        debouncedOnChange(data as LocationFormData);
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
        <CardTitle>위치 정보</CardTitle>
        <CardDescription>
          지도로 연결할 주소나 장소명을 입력하세요.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>주소 또는 장소명</FormLabel>
                <FormControl>
                  <Input
                    placeholder="서울특별시 종로구 청와대로 1"
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
