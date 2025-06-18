"use client";

import Image from "next/image";
import { FrameOptions } from "@/components/qr-code-frames";

interface QrCodePreviewWithFrameProps {
  qrCodeUrl: string;
  frameOptions: FrameOptions;
  width?: number;
  height?: number;
  alt?: string;
  className?: string;
}

export function QrCodePreviewWithFrame({
  qrCodeUrl,
  frameOptions,
  width = 256,
  height = 256,
  alt = "Generated QR Code",
  className = "",
}: QrCodePreviewWithFrameProps) {
  // PDF인 경우 iframe으로 표시
  if (qrCodeUrl && qrCodeUrl.startsWith("data:application/pdf")) {
    return (
      <iframe
        src={qrCodeUrl}
        width={width}
        height={height}
        style={{ border: "none" }}
        title="QR Code PDF Preview"
      />
    );
  }

  // 프레임이 없거나 타입이 'none'인 경우 기본 이미지만 표시
  if (!frameOptions || frameOptions.type === "none" || !qrCodeUrl) {
    return (
      <Image
        src={qrCodeUrl}
        alt={alt}
        width={width}
        height={height}
        className={className}
      />
    );
  }

  // 프레임 스타일 계산
  const getBorderRadius = () => {
    if (frameOptions.type === "rounded") {
      return "1rem";
    }
    if (frameOptions.type === "scan-me") {
      return "0.75rem";
    }
    return frameOptions.borderRadius ? `${frameOptions.borderRadius}px` : "0";
  };

  const getBorderStyle = () => {
    if (
      frameOptions.type === "scan-me" ||
      frameOptions.type === "simple" ||
      frameOptions.type === "rounded"
    ) {
      return `2px solid ${frameOptions.borderColor || "#000000"}`;
    }

    if (frameOptions.type === "custom" && frameOptions.borderWidth) {
      return `${frameOptions.borderWidth}px solid ${frameOptions.borderColor || "#000000"}`;
    }

    return "none";
  };

  const getBackgroundColor = () => {
    return frameOptions.backgroundColor || "#ffffff";
  };

  return (
    <div
      className="flex flex-col items-center"
      style={{
        padding: "20px",
        backgroundColor: getBackgroundColor(),
        border: getBorderStyle(),
        borderRadius: getBorderRadius(),
        boxShadow:
          frameOptions.type === "scan-me"
            ? "0 4px 6px rgba(0, 0, 0, 0.1)"
            : "none",
      }}
    >
      <div className="mb-4">
        <Image
          src={qrCodeUrl}
          alt={alt}
          width={width}
          height={height}
          className={className}
        />
      </div>

      {frameOptions.text && (
        <div
          className="text-center font-medium mt-2"
          style={{ color: frameOptions.textColor || "#000000" }}
        >
          {frameOptions.text}
        </div>
      )}
    </div>
  );
}
