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

interface EmailFormProps {
  onChange: (emailString: string) => void;
  initialValue?: string;
}

export function EmailForm({ onChange, initialValue }: EmailFormProps) {
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");

  // 이메일 문자열에서 개별 필드로 파싱하는 함수
  const parseEmailString = (emailStr: string) => {
    // mailto:example@email.com?subject=Subject&body=Body
    const mailtoMatch = emailStr.match(/^mailto:([^?]+)/);
    if (!mailtoMatch) return null;

    const email = mailtoMatch[1];
    const url = new URL(emailStr);
    const subject = url.searchParams.get("subject") || "";
    const body = url.searchParams.get("body") || "";

    return { email, subject, body };
  };

  // 초기값 설정
  useEffect(() => {
    if (initialValue && initialValue.startsWith("mailto:")) {
      const parsed = parseEmailString(initialValue);
      if (parsed) {
        setEmail(parsed.email);
        setSubject(parsed.subject);
        setBody(parsed.body);
      }
    }
  }, [initialValue]);

  const handleEmailChange = (value: string) => {
    setEmail(value);

    if (!value) {
      onChange("");
      return;
    }

    let emailString = `mailto:${value}`;
    const params: string[] = [];

    if (subject) {
      params.push(`subject=${encodeURIComponent(subject)}`);
    }
    if (body) {
      params.push(`body=${encodeURIComponent(body)}`);
    }

    if (params.length > 0) {
      emailString += `?${params.join("&")}`;
    }

    onChange(emailString);
  };

  const handleSubjectChange = (value: string) => {
    setSubject(value);

    if (!email) {
      onChange("");
      return;
    }

    let emailString = `mailto:${email}`;
    const params: string[] = [];

    if (value) {
      params.push(`subject=${encodeURIComponent(value)}`);
    }
    if (body) {
      params.push(`body=${encodeURIComponent(body)}`);
    }

    if (params.length > 0) {
      emailString += `?${params.join("&")}`;
    }

    onChange(emailString);
  };

  const handleBodyChange = (value: string) => {
    setBody(value);

    if (!email) {
      onChange("");
      return;
    }

    let emailString = `mailto:${email}`;
    const params: string[] = [];

    if (subject) {
      params.push(`subject=${encodeURIComponent(subject)}`);
    }
    if (value) {
      params.push(`body=${encodeURIComponent(value)}`);
    }

    if (params.length > 0) {
      emailString += `?${params.join("&")}`;
    }

    onChange(emailString);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>이메일</CardTitle>
        <CardDescription>
          이메일 주소와 제목, 내용을 설정하여 이메일 앱을 자동으로 실행하는 QR
          코드를 생성하세요.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-1 gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="email">이메일 주소 *</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => handleEmailChange(e.target.value)}
            placeholder="example@example.com"
            required
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="subject">제목 (선택사항)</Label>
          <Input
            id="subject"
            value={subject}
            onChange={(e) => handleSubjectChange(e.target.value)}
            placeholder="이메일 제목을 입력하세요"
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="body">내용 (선택사항)</Label>
          <Textarea
            id="body"
            value={body}
            onChange={(e) => handleBodyChange(e.target.value)}
            placeholder="이메일 내용을 입력하세요"
            rows={4}
          />
        </div>
      </CardContent>
    </Card>
  );
}
