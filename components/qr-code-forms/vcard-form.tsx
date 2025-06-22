"use client";

import { useState, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface VCardData {
  firstName: string;
  lastName: string;
  organization: string;
  title: string;
  phone: string;
  email: string;
  website: string;
  address: string;
}

interface VCardFormProps {
  onChange: (vcardString: string) => void;
  initialValue?: string;
}

export function VCardForm({ onChange, initialValue }: VCardFormProps) {
  const [formData, setFormData] = useState<VCardData>({
    firstName: "",
    lastName: "",
    organization: "",
    title: "",
    phone: "",
    email: "",
    website: "",
    address: "",
  });

  const parseVCardString = useCallback((vcardStr: string): VCardData | null => {
    if (!vcardStr.startsWith("BEGIN:VCARD")) return null;

    const lines = vcardStr.split(/\r?\n/);
    const data: Partial<VCardData> = {};

    lines.forEach((line) => {
      const [field, ...valueParts] = line.split(":");
      const value = valueParts.join(":");

      switch (field) {
        case "FN": {
          const nameParts = value.split(" ");
          data.firstName = nameParts[0] || "";
          data.lastName = nameParts.slice(1).join(" ") || "";
          break;
        }
        case "ORG":
          data.organization = value;
          break;
        case "TITLE":
          data.title = value;
          break;
        case "TEL":
          data.phone = value;
          break;
        case "EMAIL":
          data.email = value;
          break;
        case "URL":
          data.website = value;
          break;
        case "ADR":
          data.address = value.split(";").filter(Boolean).join(" ");
          break;
      }
    });

    return {
      firstName: data.firstName || "",
      lastName: data.lastName || "",
      organization: data.organization || "",
      title: data.title || "",
      phone: data.phone || "",
      email: data.email || "",
      website: data.website || "",
      address: data.address || "",
    };
  }, []);

  const generateVCardString = useCallback((data: VCardData): string => {
    const {
      firstName,
      lastName,
      organization,
      title,
      phone,
      email,
      website,
      address,
    } = data;

    if (!firstName && !lastName && !phone && !email) {
      return "";
    }

    const vcard = ["BEGIN:VCARD", "VERSION:3.0"];

    if (firstName || lastName) {
      vcard.push(`FN:${firstName} ${lastName}`.trim());
      vcard.push(`N:${lastName};${firstName};;;`);
    }

    if (organization) vcard.push(`ORG:${organization}`);
    if (title) vcard.push(`TITLE:${title}`);
    if (phone) vcard.push(`TEL:${phone}`);
    if (email) vcard.push(`EMAIL:${email}`);
    if (website) vcard.push(`URL:${website}`);
    if (address) vcard.push(`ADR:;;${address};;;;`);

    vcard.push("END:VCARD");

    return vcard.join("\n");
  }, []);

  const updateField = useCallback((field: keyof VCardData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  useEffect(() => {
    if (initialValue && initialValue.startsWith("BEGIN:VCARD")) {
      const parsed = parseVCardString(initialValue);
      if (parsed) {
        setFormData(parsed);
      }
    }
  }, [initialValue, parseVCardString]);

  useEffect(() => {
    const vcardString = generateVCardString(formData);
    onChange(vcardString);
  }, [formData, generateVCardString, onChange]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>연락처 (vCard)</CardTitle>
        <CardDescription>
          연락처 정보를 입력하여 주소록에 바로 추가할 수 있는 QR 코드를
          생성하세요.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-1 gap-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="firstName">이름 *</Label>
            <Input
              id="firstName"
              value={formData.firstName}
              onChange={(e) => updateField("firstName", e.target.value)}
              placeholder="홍길동"
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="lastName">성 (선택사항)</Label>
            <Input
              id="lastName"
              value={formData.lastName}
              onChange={(e) => updateField("lastName", e.target.value)}
              placeholder="홍"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="organization">회사/조직 (선택사항)</Label>
            <Input
              id="organization"
              value={formData.organization}
              onChange={(e) => updateField("organization", e.target.value)}
              placeholder="회사명"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="title">직함 (선택사항)</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => updateField("title", e.target.value)}
              placeholder="대표이사"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="phone">전화번호 (선택사항)</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => updateField("phone", e.target.value)}
              placeholder="010-1234-5678"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="email">이메일 (선택사항)</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => updateField("email", e.target.value)}
              placeholder="example@example.com"
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="website">웹사이트 (선택사항)</Label>
          <Input
            id="website"
            type="url"
            value={formData.website}
            onChange={(e) => updateField("website", e.target.value)}
            placeholder="https://example.com"
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="address">주소 (선택사항)</Label>
          <Textarea
            id="address"
            value={formData.address}
            onChange={(e) => updateField("address", e.target.value)}
            placeholder="서울특별시 강남구 테헤란로 123"
            rows={2}
          />
        </div>
      </CardContent>
    </Card>
  );
}
