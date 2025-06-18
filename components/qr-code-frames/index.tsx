"use client";

import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export type FrameType = "none" | "scan-me" | "simple" | "rounded" | "custom";

export interface FrameOptions {
  type: FrameType;
  text?: string;
  textColor?: string;
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: number;
  borderRadius?: number;
}

const DEFAULT_FRAME_OPTIONS: FrameOptions = {
  type: "none",
  text: "스캔해 주세요",
  textColor: "#000000",
  backgroundColor: "#ffffff",
  borderColor: "#000000",
  borderWidth: 2,
  borderRadius: 8,
};

interface QrCodeFramesSelectorProps {
  value: FrameOptions;
  onChange: (value: FrameOptions) => void;
}

export function QrCodeFramesSelector({
  value = DEFAULT_FRAME_OPTIONS,
  onChange,
}: QrCodeFramesSelectorProps) {
  const [frameType, setFrameType] = useState<FrameType>(value.type || "none");

  const handleFrameTypeChange = (type: FrameType) => {
    setFrameType(type);

    // 사용자 정의에서 다른 스타일로 변경될 때 색상 초기화
    if (value.type === "custom" && type !== "custom") {
      onChange({
        ...value,
        type,
        textColor: DEFAULT_FRAME_OPTIONS.textColor,
        backgroundColor: DEFAULT_FRAME_OPTIONS.backgroundColor,
        borderColor: DEFAULT_FRAME_OPTIONS.borderColor,
      });
    } else {
      onChange({ ...value, type });
    }
  };

  const handleTextChange = (text: string) => {
    onChange({ ...value, text });
  };

  const handleColorChange = (
    colorType: "textColor" | "backgroundColor" | "borderColor",
    color: string,
  ) => {
    onChange({ ...value, [colorType]: color });
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="frame-type">프레임 스타일</Label>
        <Select
          value={frameType}
          onValueChange={(val) => handleFrameTypeChange(val as FrameType)}
        >
          <SelectTrigger id="frame-type">
            <SelectValue placeholder="프레임 스타일 선택" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">없음</SelectItem>
            <SelectItem value="scan-me">스캔해 주세요</SelectItem>
            <SelectItem value="simple">심플</SelectItem>
            <SelectItem value="rounded">둥근 모서리</SelectItem>
            <SelectItem value="custom">사용자 정의</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {frameType !== "none" && (
        <>
          <div>
            <Label htmlFor="frame-text">프레임 텍스트</Label>
            <Input
              id="frame-text"
              value={value.text || ""}
              onChange={(e) => handleTextChange(e.target.value)}
              placeholder="스캔해 주세요"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="text-color">텍스트 색상</Label>
              <div className="flex gap-2">
                <Input
                  id="text-color"
                  type="color"
                  value={value.textColor || "#000000"}
                  onChange={(e) =>
                    handleColorChange("textColor", e.target.value)
                  }
                />
              </div>
            </div>

            <div>
              <Label htmlFor="border-color">테두리 색상</Label>
              <div className="flex gap-2">
                <Input
                  id="border-color"
                  type="color"
                  value={value.borderColor || "#000000"}
                  onChange={(e) =>
                    handleColorChange("borderColor", e.target.value)
                  }
                />
              </div>
            </div>
          </div>

          {frameType === "custom" && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="background-color">배경 색상</Label>
                <div className="flex gap-2">
                  <Input
                    id="background-color"
                    type="color"
                    value={value.backgroundColor || "#ffffff"}
                    onChange={(e) =>
                      handleColorChange("backgroundColor", e.target.value)
                    }
                  />
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export function renderFrame(
  qrCodeDataUrl: string,
  options: FrameOptions,
): string {
  if (options.type === "none" || !qrCodeDataUrl) {
    return qrCodeDataUrl;
  }

  // URL이 data URL이 아닌 경우 처리 로직 추가 필요
  if (!qrCodeDataUrl.startsWith("data:")) {
    return qrCodeDataUrl;
  }

  // 실제 프로덕션 코드에서는 canvas나 SVG를 사용하여 더 복잡한 프레임을 그릴 수 있지만,
  // 여기서는 간단한 HTML을 생성합니다.
  // 이 예제에서는 실제로 이미지를 조작하지 않고, UI 레벨에서만 프레임을 표시합니다.
  return qrCodeDataUrl;
}
