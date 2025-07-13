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

export function CardVCard() {
  return (
    <Card data-testid="card-vcard">
      <CardHeader>
        <CardTitle>연락처 정보</CardTitle>
        <CardDescription>
          명함 정보를 입력하세요. 이름, 전화번호, 이메일 중 하나는 필수입니다.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FieldVcardFullName />
        <FieldVcardPhoneNumber />
        <FieldVcardEmail />
        <FieldVcardOrganization />
        <FieldVcardJobTitle />
        <FieldVcardWebsite />
        <FieldVcardAddress />
      </CardContent>
    </Card>
  );
}

function FieldVcardFullName() {
  const { control } = useFormContext<QrcodeFormValues>();

  return (
    <FormField
      control={control}
      name="vcardFullName"
      render={({ field }) => (
        <FormItem>
          <FormLabel>
            이름 <span className="text-xs text-destructive">(필수)</span>
          </FormLabel>
          <FormControl>
            <Input placeholder="홍길동" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

function FieldVcardPhoneNumber() {
  const { control } = useFormContext<QrcodeFormValues>();

  return (
    <FormField
      control={control}
      name="vcardPhoneNumber"
      render={({ field }) => (
        <FormItem>
          <FormLabel>
            전화번호 <span className="text-xs">(선택)</span>
          </FormLabel>
          <FormControl>
            <Input type="tel" placeholder="010-1234-5678" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

function FieldVcardEmail() {
  const { control } = useFormContext<QrcodeFormValues>();

  return (
    <FormField
      control={control}
      name="vcardEmail"
      render={({ field }) => (
        <FormItem>
          <FormLabel>
            이메일 <span className="text-xs">(선택)</span>
          </FormLabel>
          <FormControl>
            <Input type="email" placeholder="example@domain.com" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

function FieldVcardOrganization() {
  const { control } = useFormContext<QrcodeFormValues>();

  return (
    <FormField
      control={control}
      name="vcardOrganization"
      render={({ field }) => (
        <FormItem>
          <FormLabel>
            회사/조직 <span className="text-xs">(선택)</span>
          </FormLabel>
          <FormControl>
            <Input placeholder="회사명" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

function FieldVcardJobTitle() {
  const { control } = useFormContext<QrcodeFormValues>();

  return (
    <FormField
      control={control}
      name="vcardJobTitle"
      render={({ field }) => (
        <FormItem>
          <FormLabel>
            직함 <span className="text-xs">(선택)</span>
          </FormLabel>
          <FormControl>
            <Input placeholder="직책/직위" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

function FieldVcardWebsite() {
  const { control } = useFormContext<QrcodeFormValues>();

  return (
    <FormField
      control={control}
      name="vcardWebsite"
      render={({ field }) => (
        <FormItem className="col-span-1 md:col-span-2">
          <FormLabel>
            웹사이트 <span className="text-xs">(선택)</span>
          </FormLabel>
          <FormControl>
            <Input type="url" placeholder="https://example.com" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

function FieldVcardAddress() {
  const { control, setValue } = useFormContext<QrcodeFormValues>();

  const handleAddressSelect = (data: AddressData) => {
    setValue("vcardAddress", data.address);
  };

  return (
    <FormField
      control={control}
      name="vcardAddress"
      render={({ field }) => (
        <FormItem className="col-span-1 md:col-span-2">
          <FormLabel>
            주소 <span className="text-xs">(선택)</span>
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
