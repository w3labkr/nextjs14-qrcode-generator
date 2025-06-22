"use client";

import TemplateManager from "@/components/template-manager";
import { QrCodeOptions } from "@/app/actions/qr-code";

export default function TemplatesPage() {
  const handleLoadTemplate = (settings: QrCodeOptions) => {
    localStorage.setItem("qr-template-settings", JSON.stringify(settings));
    window.location.href = "/";
  };

  const getCurrentSettings = (): QrCodeOptions => ({
    text: "",
    color: {
      dark: "#000000",
      light: "#ffffff",
    },
    width: 400,
  });

  return (
    <TemplateManager
      onLoadTemplate={handleLoadTemplate}
      currentSettings={getCurrentSettings()}
    />
  );
}
