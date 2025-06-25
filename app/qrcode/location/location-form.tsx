"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
