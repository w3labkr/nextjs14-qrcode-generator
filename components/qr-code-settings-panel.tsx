"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { QrCodeFramesSelector } from "@/components/qr-code-frames/index";

interface QrCodeSettingsPanelProps {
  foregroundColor: string;
  setForegroundColor: (color: string) => void;
  backgroundColor: string;
  setBackgroundColor: (color: string) => void;
  logo: string | null;
  onLogoUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  frameOptions: import("@/components/qr-code-frames").FrameOptions;
  setFrameOptions: (
    options: import("@/components/qr-code-frames").FrameOptions,
  ) => void;
}

export function QrCodeSettingsPanel({
  foregroundColor,
  setForegroundColor,
  backgroundColor,
  setBackgroundColor,
  logo,
  onLogoUpload,
  frameOptions,
  setFrameOptions,
}: QrCodeSettingsPanelProps) {
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>디자인</CardTitle>
          <CardDescription>QR 코드의 색상과 로고를 설정하세요.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="foreground-color">전경색</Label>
            <Input
              id="foreground-color"
              type="color"
              value={foregroundColor}
              onChange={(e) => setForegroundColor(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="background-color">배경색</Label>
            <Input
              id="background-color"
              type="color"
              value={backgroundColor}
              onChange={(e) => setBackgroundColor(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2 sm:col-span-2">
            <Label htmlFor="logo-upload">로고 (선택 사항)</Label>
            <Input
              id="logo-upload"
              type="file"
              accept="image/png, image/jpeg, image/svg+xml"
              onChange={onLogoUpload}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>프레임 추가</CardTitle>
          <CardDescription>
            QR 코드에 안내 문구와 프레임을 추가해 스캔율을 높이세요.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <QrCodeFramesSelector
            value={frameOptions}
            onChange={setFrameOptions}
          />
        </CardContent>
      </Card>
    </>
  );
}
