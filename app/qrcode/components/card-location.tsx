"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFormContext, useWatch } from "react-hook-form";
import * as z from "zod";
import { QrcodeFormValues } from "./qrcode-form";

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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { AddressSearch, AddressData } from "@/components/address-search";

export function CardLocation() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>위치 정보</CardTitle>
        <CardDescription>
          지도로 연결할 주소나 장소명을 입력하세요.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <FieldLocation />
      </CardContent>
    </Card>
  );
}

function FieldLocation() {
  const { control, setValue } = useFormContext<QrcodeFormValues>();

  const handleAddressSelect = (data: AddressData) => {
    setValue("location", data.address);
  };

  return (
    <FormField
      control={control}
      name="location"
      render={({ field }) => (
        <FormItem>
          <FormLabel>
            주소 <span className="text-xs text-destructive">(필수)</span>
          </FormLabel>
          <div className="flex items-center space-x-2">
            <FormControl>
              <Input placeholder="서울특별시 강남구 테헤란로 123" {...field} />
            </FormControl>
            <AddressSearch onSelect={handleAddressSelect} />
          </div>
          <FormDescription>
            정확한 주소나 장소명을 입력하거나 검색 버튼을 클릭하여 다음 우편번호
            서비스로 주소를 찾으세요.
          </FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
