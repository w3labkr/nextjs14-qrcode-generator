"use client";

import { useEffect } from "react";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { GITHUB_REPO_URL } from "@/lib/constants";

interface UrlFormProps {
  value: string;
  onChange: (value: string) => void;
}

export function UrlForm({ value, onChange }: UrlFormProps) {
  useEffect(() => {
    // URL 탭이 선택되었을 때 기본값 설정
    if (!value) {
      onChange(GITHUB_REPO_URL);
    }
  }, [value, onChange]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>웹사이트 URL</CardTitle>
        <CardDescription>연결할 웹사이트 주소를 입력하세요.</CardDescription>
      </CardHeader>
      <CardContent>
        <Input
          type="url"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://example.com"
          required
        />
      </CardContent>
    </Card>
  );
}
