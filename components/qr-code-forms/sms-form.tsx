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

interface SmsFormProps {
  onChange: (smsString: string) => void;
  initialValue?: string;
}

export function SmsForm({ onChange, initialValue }: SmsFormProps) {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [message, setMessage] = useState("");

  // SMS 문자열에서 개별 필드로 파싱하는 함수
  const parseSmsString = (smsStr: string) => {
    // sms:01012345678?body=Hello
    const smsMatch = smsStr.match(/^sms:([^?]+)/);
    if (!smsMatch) return null;

    const phoneNumber = smsMatch[1];
    const url = new URL(smsStr);
    const message = url.searchParams.get("body") || "";

    return { phoneNumber, message };
  };

  // 초기값 설정
  useEffect(() => {
    if (initialValue && initialValue.startsWith("sms:")) {
      const parsed = parseSmsString(initialValue);
      if (parsed) {
        setPhoneNumber(parsed.phoneNumber);
        setMessage(parsed.message);
      }
    }
  }, [initialValue]);

  const generateSmsString = () => {
    if (!phoneNumber) {
      onChange("");
      return;
    }

    // SMS URI 형식: sms:number?body=message
    let smsString = `sms:${phoneNumber}`;
    if (message) {
      smsString += `?body=${encodeURIComponent(message)}`;
    }

    onChange(smsString);
  };

  // 값이 변경될 때마다 SMS 문자열 생성
  useEffect(() => {
    generateSmsString();
  }, [phoneNumber, message]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>SMS/문자</CardTitle>
        <CardDescription>
          전화번호와 메시지를 설정하여 문자 앱을 자동으로 실행하는 QR 코드를
          생성하세요.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-1 gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="phone">전화번호 *</Label>
          <Input
            id="phone"
            type="tel"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="010-1234-5678 또는 +821012345678"
            required
          />
          <p className="text-xs text-muted-foreground">
            국가 코드를 포함하여 입력하면 더 정확합니다 (예: +82-10-1234-5678)
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="message">메시지 (선택사항)</Label>
          <Textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="미리 입력할 문자 메시지를 작성하세요"
            rows={4}
          />
        </div>
      </CardContent>
    </Card>
  );
}
