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

const vcardSchema = z
  .object({
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    organization: z.string().optional(),
    title: z.string().optional(),
    phone: z.string().optional(),
    email: z
      .string()
      .email("올바른 이메일 주소를 입력해주세요")
      .optional()
      .or(z.literal("")),
    website: z
      .string()
      .url("올바른 웹사이트 주소를 입력해주세요")
      .optional()
      .or(z.literal("")),
    address: z.string().optional(),
  })
  .refine(
    (data) => data.firstName || data.lastName || data.phone || data.email,
    {
      message: "이름, 전화번호, 이메일 중 하나는 반드시 입력해야 합니다",
      path: ["firstName"],
    },
  );

type VCardFormData = z.infer<typeof vcardSchema>;

interface VCardFormProps {
  onChange: (data: string) => void;
}

export function VCardForm({ onChange }: VCardFormProps) {
  const form = useForm<VCardFormData>({
    resolver: zodResolver(vcardSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      organization: "",
      title: "",
      phone: "",
      email: "",
      website: "",
      address: "",
    },
    mode: "onChange",
  });

  // QR 콘텐츠 생성 함수
  const generateVCardContent = (data: VCardFormData) => {
    if (!data.firstName && !data.lastName && !data.phone && !data.email)
      return "";

    const vcard = ["BEGIN:VCARD", "VERSION:3.0"];

    if (data.firstName || data.lastName) {
      vcard.push(`FN:${data.firstName} ${data.lastName}`.trim());
      vcard.push(`N:${data.lastName};${data.firstName};;;`);
    }

    if (data.organization) vcard.push(`ORG:${data.organization}`);
    if (data.title) vcard.push(`TITLE:${data.title}`);
    if (data.phone) vcard.push(`TEL:${data.phone}`);
    if (data.email) vcard.push(`EMAIL:${data.email}`);
    if (data.website) vcard.push(`URL:${data.website}`);
    if (data.address) vcard.push(`ADR:;;${data.address};;;;`);

    vcard.push("END:VCARD");

    return vcard.join("\n");
  };

  useEffect(() => {
    const subscription = form.watch((data) => {
      if (
        (data.firstName || data.lastName || data.phone || data.email) &&
        form.formState.isValid
      ) {
        const content = generateVCardContent(data as VCardFormData);
        onChange(content);
      }
    });
    return () => {
      subscription.unsubscribe();
    };
  }, [form.watch, form.formState.isValid, onChange]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>연락처 정보</CardTitle>
        <CardDescription>
          명함 정보를 입력하세요. 이름, 전화번호, 이메일 중 하나는 필수입니다.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>이름</FormLabel>
                    <FormControl>
                      <Input placeholder="홍" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>성</FormLabel>
                    <FormControl>
                      <Input placeholder="길동" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="organization"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>회사/조직</FormLabel>
                  <FormControl>
                    <Input placeholder="회사명" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>직책</FormLabel>
                  <FormControl>
                    <Input placeholder="직책/직위" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>전화번호</FormLabel>
                  <FormControl>
                    <Input type="tel" placeholder="010-1234-5678" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>이메일</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="example@domain.com"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="website"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>웹사이트</FormLabel>
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
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>주소</FormLabel>
                  <FormControl>
                    <Input placeholder="주소" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </Form>
      </CardContent>
    </Card>
  );
}
