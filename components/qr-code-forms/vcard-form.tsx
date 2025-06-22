"use client";

import { useState, useEffect } from "react";
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

interface VCardFormProps {
  onChange: (vcardString: string) => void;
  initialValue?: string;
}

export function VCardForm({ onChange, initialValue }: VCardFormProps) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [organization, setOrganization] = useState("");
  const [title, setTitle] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [address, setAddress] = useState("");

  // VCard 문자열에서 개별 필드로 파싱하는 함수
  const parseVCardString = (vcardStr: string) => {
    if (!vcardStr.startsWith("BEGIN:VCARD")) return null;

    const lines = vcardStr.split(/\r?\n/);
    const data: any = {};

    lines.forEach((line) => {
      if (line.startsWith("FN:")) {
        const fullName = line.substring(3);
        const nameParts = fullName.split(" ");
        data.firstName = nameParts[0] || "";
        data.lastName = nameParts.slice(1).join(" ") || "";
      } else if (line.startsWith("ORG:")) {
        data.organization = line.substring(4);
      } else if (line.startsWith("TITLE:")) {
        data.title = line.substring(6);
      } else if (line.startsWith("TEL:")) {
        data.phone = line.substring(4);
      } else if (line.startsWith("EMAIL:")) {
        data.email = line.substring(6);
      } else if (line.startsWith("URL:")) {
        data.website = line.substring(4);
      } else if (line.startsWith("ADR:")) {
        data.address = line.substring(4).split(";").join(" ");
      }
    });

    return data;
  };

  // 초기값 설정
  useEffect(() => {
    if (initialValue && initialValue.startsWith("BEGIN:VCARD")) {
      const parsed = parseVCardString(initialValue);
      if (parsed) {
        setFirstName(parsed.firstName || "");
        setLastName(parsed.lastName || "");
        setOrganization(parsed.organization || "");
        setTitle(parsed.title || "");
        setPhone(parsed.phone || "");
        setEmail(parsed.email || "");
        setWebsite(parsed.website || "");
        setAddress(parsed.address || "");
      }
    }
  }, [initialValue]);

  const generateVCardString = () => {
    if (!firstName && !lastName && !phone && !email) {
      onChange("");
      return;
    }

    const vcard = ["BEGIN:VCARD", "VERSION:3.0"];

    // 이름
    if (firstName || lastName) {
      vcard.push(`FN:${firstName} ${lastName}`.trim());
      vcard.push(`N:${lastName};${firstName};;;`);
    }

    // 조직 및 직함
    if (organization) {
      vcard.push(`ORG:${organization}`);
    }
    if (title) {
      vcard.push(`TITLE:${title}`);
    }

    // 연락처 정보
    if (phone) {
      vcard.push(`TEL:${phone}`);
    }
    if (email) {
      vcard.push(`EMAIL:${email}`);
    }
    if (website) {
      vcard.push(`URL:${website}`);
    }

    // 주소
    if (address) {
      vcard.push(`ADR:;;${address};;;;`);
    }

    vcard.push("END:VCARD");

    onChange(vcard.join("\n"));
  };

  // 값이 변경될 때마다 vCard 문자열 생성
  useEffect(() => {
    generateVCardString();
  }, [
    firstName,
    lastName,
    organization,
    title,
    phone,
    email,
    website,
    address,
  ]);

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
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="홍길동"
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="lastName">성 (선택사항)</Label>
            <Input
              id="lastName"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="홍"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="organization">회사/조직 (선택사항)</Label>
            <Input
              id="organization"
              value={organization}
              onChange={(e) => setOrganization(e.target.value)}
              placeholder="회사명"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="title">직함 (선택사항)</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
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
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="010-1234-5678"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="email">이메일 (선택사항)</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@example.com"
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="website">웹사이트 (선택사항)</Label>
          <Input
            id="website"
            type="url"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            placeholder="https://example.com"
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="address">주소 (선택사항)</Label>
          <Textarea
            id="address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="서울특별시 강남구 테헤란로 123"
            rows={2}
          />
        </div>
      </CardContent>
    </Card>
  );
}
