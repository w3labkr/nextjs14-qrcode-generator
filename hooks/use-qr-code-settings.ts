"use client";

import { useState, useCallback } from "react";
import type {
  QrCodeSettings,
  FrameOptions,
  QrCodeFormat,
} from "@/types/qr-code";
import type { QrCodeOptions } from "@/app/actions/qr-code";

export function useQrCodeSettings() {
  const [foregroundColor, setForegroundColor] = useState("#000000");
  const [backgroundColor, setBackgroundColor] = useState("#ffffff");
  const [logo, setLogo] = useState<string | null>(null);
  const [format, setFormat] = useState<QrCodeFormat>("png");
  const [width, setWidth] = useState(400);
  const [frameOptions, setFrameOptions] = useState<FrameOptions>({
    type: "none",
    text: "스캔해 주세요",
    textColor: "#000000",
    borderColor: "#000000",
    backgroundColor: "#ffffff",
  });

  const loadSettings = useCallback((settings: QrCodeOptions) => {
    if (settings.color?.dark) setForegroundColor(settings.color.dark);
    if (settings.color?.light) setBackgroundColor(settings.color.light);
    if (settings.logo) setLogo(settings.logo);
    if (settings.width) setWidth(settings.width);

    if (settings.frameOptions) {
      setFrameOptions({
        type: (settings.frameOptions.type as any) || "none",
        text: settings.frameOptions.text || "스캔해 주세요",
        textColor: settings.frameOptions.textColor || "#000000",
        borderColor: settings.frameOptions.borderColor || "#000000",
        backgroundColor: settings.frameOptions.backgroundColor || "#ffffff",
        borderWidth: settings.frameOptions.borderWidth || 2,
        borderRadius: settings.frameOptions.borderRadius || 8,
      });
    } else {
      setFrameOptions({
        type: "none",
        text: "스캔해 주세요",
        textColor: "#000000",
        borderColor: "#000000",
        backgroundColor: "#ffffff",
        borderWidth: 2,
        borderRadius: 8,
      });
    }
  }, []);

  const getCurrentSettings = useCallback(
    (qrData: string): QrCodeOptions => ({
      text: qrData,
      color: {
        dark: foregroundColor,
        light: backgroundColor,
      },
      logo: logo || undefined,
      width,
      frameOptions:
        frameOptions.type !== "none"
          ? {
              type: frameOptions.type,
              text: frameOptions.text,
              textColor: frameOptions.textColor,
              backgroundColor: frameOptions.backgroundColor,
              borderColor: frameOptions.borderColor,
              borderWidth: frameOptions.borderWidth,
              borderRadius: frameOptions.borderRadius,
            }
          : undefined,
    }),
    [foregroundColor, backgroundColor, logo, width, frameOptions],
  );

  const handleLogoUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setLogo(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    },
    [],
  );

  return {
    foregroundColor,
    setForegroundColor,
    backgroundColor,
    setBackgroundColor,
    logo,
    setLogo,
    format,
    setFormat,
    width,
    setWidth,
    frameOptions,
    setFrameOptions,
    loadSettings,
    getCurrentSettings,
    handleLogoUpload,
  };
}
