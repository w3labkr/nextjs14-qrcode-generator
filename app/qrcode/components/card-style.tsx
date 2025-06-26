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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

export function CardStyle() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>디자인</CardTitle>
        <CardDescription>
          QR 코드의 디자인을 설정합니다. 프레임 스타일, 안내 문구, 색상 등을
          조정할 수 있습니다.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FieldStyleForegroundColor />
        <FieldStyleBackgroundColor />
        <FieldStyleLogo />
        <FieldStyleBorderStyle />
        <FieldStyleText />
        <FieldStyleBorderColor />
        <FieldStyleTextColor />
      </CardContent>
    </Card>
  );
}

function FieldStyleForegroundColor() {
  const { control } = useFormContext<QrcodeFormValues>();

  return (
    <FormField
      control={control}
      name="styleForegroundColor"
      render={({ field }) => (
        <FormItem>
          <FormLabel>
            전경색 <span className="text-xs">(선택)</span>
          </FormLabel>
          <FormControl>
            <Input type="color" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

function FieldStyleBackgroundColor() {
  const { control } = useFormContext<QrcodeFormValues>();

  return (
    <FormField
      control={control}
      name="styleBackgroundColor"
      render={({ field }) => (
        <FormItem>
          <FormLabel>
            배경색 <span className="text-xs">(선택)</span>
          </FormLabel>
          <FormControl>
            <Input type="color" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

function FieldStyleLogo() {
  const { control } = useFormContext<QrcodeFormValues>();

  return (
    <FormField
      control={control}
      name="styleLogo"
      render={({ field }) => (
        <FormItem className="col-span-2">
          <FormLabel>
            로고 <span className="text-xs">(선택)</span>
          </FormLabel>
          <FormControl>
            <Input type="file" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

function FieldStyleBorderStyle() {
  const { control } = useFormContext<QrcodeFormValues>();

  return (
    <FormField
      control={control}
      name="styleBorderStyle"
      render={({ field }) => (
        <FormItem className="col-span-2">
          <FormLabel>
            테두리 스타일 <span className="text-xs">(선택)</span>
          </FormLabel>
          <FormControl>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="테두리 스타일 선택" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="none">없음</SelectItem>
                <SelectItem value="simple">심플</SelectItem>
                <SelectItem value="rounded">둥근 모서리</SelectItem>
                <SelectItem value="custom">사용자 정의</SelectItem>
              </SelectContent>
            </Select>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

function FieldStyleText() {
  const { control } = useFormContext<QrcodeFormValues>();

  return (
    <FormField
      control={control}
      name="styleText"
      render={({ field }) => (
        <FormItem className="col-span-2">
          <FormLabel>
            안내 문구 <span className="text-xs">(선택)</span>
          </FormLabel>
          <FormControl>
            <Input
              placeholder="QR 코드에 표시할 안내 문구를 입력하세요."
              {...field}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

function FieldStyleBorderColor() {
  const { control } = useFormContext<QrcodeFormValues>();

  return (
    <FormField
      control={control}
      name="styleBorderColor"
      render={({ field }) => (
        <FormItem>
          <FormLabel>
            테두리 색상 <span className="text-xs">(선택)</span>
          </FormLabel>
          <FormControl>
            <Input type="color" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

function FieldStyleTextColor() {
  const { control } = useFormContext<QrcodeFormValues>();

  return (
    <FormField
      control={control}
      name="styleTextColor"
      render={({ field }) => (
        <FormItem>
          <FormLabel>
            안내 문구 색상 <span className="text-xs">(선택)</span>
          </FormLabel>
          <FormControl>
            <Input type="color" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
