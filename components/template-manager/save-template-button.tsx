"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { QrCodeOptions } from "@/app/actions/qr-code";
import { toast } from "sonner";
import { Template } from "@/types/data-manager";
import { updateTemplate } from "@/app/actions/template-management";

interface SaveTemplateButtonProps {
  template: Template;
  currentSettings: QrCodeOptions;
  onTemplateUpdate: () => void;
}

export default function SaveTemplateButton({
  template,
  currentSettings,
  onTemplateUpdate,
}: SaveTemplateButtonProps) {
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveToTemplate = async (e: React.MouseEvent) => {
    e.stopPropagation();

    try {
      setIsSaving(true);
      await updateTemplate(template.id, {
        settings: currentSettings,
      });
      toast.success(
        `"${template.name}" 템플릿이 현재 설정으로 업데이트되었습니다!`,
      );
      onTemplateUpdate();
    } catch (error) {
      console.error("템플릿 저장 오류:", error);
      toast.error("템플릿 저장에 실패했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Button
      size="sm"
      variant="outline"
      onClick={handleSaveToTemplate}
      disabled={isSaving}
    >
      {isSaving ? "저장 중..." : "저장"}
    </Button>
  );
}
