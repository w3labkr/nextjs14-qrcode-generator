"use client";

import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface TextFormProps {
  value: string;
  onChange: (value: string) => void;
}

export function TextForm({ value, onChange }: TextFormProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>일반 텍스트</CardTitle>
        <CardDescription>
          공유하고 싶은 텍스트를 자유롭게 입력하세요.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="여기에 텍스트를 입력하세요"
          required
        />
      </CardContent>
    </Card>
  );
}
