"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { updateTemplate, QrCodeOptions } from "@/app/actions/qr-code";
import { toast } from "sonner";
import { Template } from "@/types/data-manager";
import { QrCodeSettingsPanel } from "@/components/qr-code-settings-panel";
import { FrameOptions, FrameType } from "@/components/qr-code-frames";

interface EditTemplateDialogProps {
  template: Template | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateComplete: () => void;
}

export default function EditTemplateDialog({
  template,
  isOpen,
  onClose,
  onUpdateComplete,
}: EditTemplateDialogProps) {
  const [templateName, setTemplateName] = useState(template?.name || "");
  const [isDefault, setIsDefault] = useState(template?.isDefault || false);

  // QR 코드 디자인 설정 상태
  const [foregroundColor, setForegroundColor] = useState("#000000");
  const [backgroundColor, setBackgroundColor] = useState("#ffffff");
  const [logo, setLogo] = useState<string | null>(null);
  const [frameOptions, setFrameOptions] = useState<FrameOptions>({
    type: "none",
    text: "스캔해 주세요",
    textColor: "#000000",
    backgroundColor: "#ffffff",
    borderColor: "#000000",
    borderWidth: 2,
    borderRadius: 8,
  });

  // 템플릿이 변경될 때 상태 업데이트
  useEffect(() => {
    if (template) {
      setTemplateName(template.name);
      setIsDefault(template.isDefault);

      // 템플릿 설정 파싱
      try {
        const settings: QrCodeOptions = JSON.parse(template.settings);

        if (settings.color?.dark) {
          setForegroundColor(settings.color.dark);
        }
        if (settings.color?.light) {
          setBackgroundColor(settings.color.light);
        }
        if (settings.logo) {
          setLogo(settings.logo);
        }
        if (settings.frameOptions) {
          setFrameOptions({
            type: (settings.frameOptions.type as FrameType) || "none",
            text: settings.frameOptions.text || "스캔해 주세요",
            textColor: settings.frameOptions.textColor || "#000000",
            backgroundColor: settings.frameOptions.backgroundColor || "#ffffff",
            borderColor: settings.frameOptions.borderColor || "#000000",
            borderWidth: settings.frameOptions.borderWidth || 2,
            borderRadius: settings.frameOptions.borderRadius || 8,
          });
        }
      } catch (error) {
        console.warn("템플릿 설정 파싱 실패:", error);
      }
    }
  }, [template]);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setLogo(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateTemplate = async () => {
    if (!template || !templateName.trim()) {
      toast.error("템플릿 이름을 입력해주세요.");
      return;
    }

    try {
      const settings: QrCodeOptions = {
        text: "", // 템플릿에서는 텍스트는 저장하지 않음
        color: {
          dark: foregroundColor,
          light: backgroundColor,
        },
        ...(logo && { logo }),
        frameOptions: {
          type: frameOptions.type,
          text: frameOptions.text,
          textColor: frameOptions.textColor,
          backgroundColor: frameOptions.backgroundColor,
          borderColor: frameOptions.borderColor,
          borderWidth: frameOptions.borderWidth,
          borderRadius: frameOptions.borderRadius,
        },
      };

      await updateTemplate(template.id, {
        name: templateName,
        settings,
        isDefault,
      });

      toast.success("템플릿이 업데이트되었습니다!");
      onClose();
      onUpdateComplete();
    } catch (error) {
      console.error("템플릿 업데이트 오류:", error);
      toast.error("템플릿 업데이트에 실패했습니다.");
    }
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>템플릿 편집</DialogTitle>
          <DialogDescription>
            템플릿 이름과 설정을 변경할 수 있습니다.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-template-name">템플릿 이름</Label>
              <Input
                id="edit-template-name"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                placeholder="템플릿 이름을 입력하세요"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="edit-default-template"
                checked={isDefault}
                onCheckedChange={setIsDefault}
              />
              <Label htmlFor="edit-default-template">
                기본 템플릿으로 설정
              </Label>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">QR 코드 설정</h3>
            <QrCodeSettingsPanel
              foregroundColor={foregroundColor}
              setForegroundColor={setForegroundColor}
              backgroundColor={backgroundColor}
              setBackgroundColor={setBackgroundColor}
              logo={logo}
              onLogoUpload={handleLogoUpload}
              frameOptions={frameOptions}
              setFrameOptions={setFrameOptions}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            취소
          </Button>
          <Button onClick={handleUpdateTemplate}>저장</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
