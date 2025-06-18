"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface FrameOptions {
  type: string;
  text: string;
  textColor: string;
  borderColor: string;
  backgroundColor: string;
}

const DEFAULT_FRAME_OPTIONS: FrameOptions = {
  type: "none",
  text: "스캔해 주세요",
  textColor: "#000000",
  borderColor: "#000000",
  backgroundColor: "#ffffff",
};

interface FrameSelectorProps {
  value: FrameOptions;
  onChange: (value: FrameOptions) => void;
}

export function FrameSelector({
  value = DEFAULT_FRAME_OPTIONS,
  onChange,
}: FrameSelectorProps) {
  const handleChange = (field: keyof FrameOptions, newValue: string) => {
    onChange({
      ...value,
      [field]: newValue,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>프레임 추가</CardTitle>
        <CardDescription>
          QR 코드에 프레임과 안내 문구를 추가해 사용자의 관심을 유도하세요.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="frame-type">프레임 타입</Label>
          <Select
            value={value.type}
            onValueChange={(val) => handleChange("type", val)}
          >
            <SelectTrigger id="frame-type">
              <SelectValue placeholder="프레임 타입 선택" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">없음</SelectItem>
              <SelectItem value="basic">기본</SelectItem>
              <SelectItem value="rounded">둥근 모서리</SelectItem>
              <SelectItem value="shadow">그림자 효과</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {value.type !== "none" && (
          <>
            <div>
              <Label htmlFor="frame-text">안내 문구</Label>
              <Input
                id="frame-text"
                value={value.text}
                onChange={(e) => handleChange("text", e.target.value)}
                placeholder="스캔해 주세요"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="text-color">텍스트 색상</Label>
                <Input
                  id="text-color"
                  type="color"
                  value={value.textColor}
                  onChange={(e) => handleChange("textColor", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="border-color">테두리 색상</Label>
                <Input
                  id="border-color"
                  type="color"
                  value={value.borderColor}
                  onChange={(e) => handleChange("borderColor", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="background-color">배경 색상</Label>
                <Input
                  id="background-color"
                  type="color"
                  value={value.backgroundColor}
                  onChange={(e) =>
                    handleChange("backgroundColor", e.target.value)
                  }
                />
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

interface FrameRendererProps {
  frameOptions: FrameOptions;
  qrCodeUrl: string;
  width?: number;
}

export function FrameRenderer({
  frameOptions,
  qrCodeUrl,
  width = 256,
}: FrameRendererProps) {
  if (frameOptions.type === "none" || !qrCodeUrl) {
    return null;
  }

  // 프레임 스타일 계산
  const getBorderRadius = () => {
    switch (frameOptions.type) {
      case "rounded":
        return "1rem";
      case "shadow":
        return "0.5rem";
      default:
        return "0";
    }
  };

  const getShadow = () => {
    return frameOptions.type === "shadow"
      ? "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)"
      : "none";
  };

  return (
    <div
      style={{
        position: "relative",
        width: `${width + 80}px`,
        padding: "40px 20px",
        backgroundColor: frameOptions.backgroundColor,
        border: `2px solid ${frameOptions.borderColor}`,
        borderRadius: getBorderRadius(),
        boxShadow: getShadow(),
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div style={{ marginBottom: "20px" }}>
        <img
          src={qrCodeUrl}
          alt="QR Code"
          width={width}
          height={width}
          style={{ display: "block" }}
        />
      </div>

      <div
        style={{
          color: frameOptions.textColor,
          fontSize: "16px",
          fontWeight: "bold",
          textAlign: "center",
        }}
      >
        {frameOptions.text}
      </div>
    </div>
  );
}
