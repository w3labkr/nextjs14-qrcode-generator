"use client";

import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { saveTemplate } from "@/app/actions/qr-code";
import { QrCodeOptions } from "@/app/actions/qr-code";

interface SaveTemplateDialogProps {
  currentSettings: QrCodeOptions;
  onSaveComplete: () => void;
}

export default function SaveTemplateDialog({
  currentSettings,
  onSaveComplete,
}: SaveTemplateDialogProps) {
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [templateName, setTemplateName] = useState("");
  const [isDefault, setIsDefault] = useState(false);

  const handleSaveTemplate = async () => {
    if (!templateName.trim()) {
      toast.error("템플릿 이름을 입력해주세요.");
      return;
    }

    try {
      await saveTemplate({
        name: templateName,
        settings: currentSettings,
        isDefault,
      });

      toast.success("템플릿이 저장되었습니다!");
      setTemplateName("");
      setIsDefault(false);
      setSaveDialogOpen(false);
      onSaveComplete();
    } catch (error) {
      console.error("템플릿 저장 오류:", error);
      toast.error("템플릿 저장에 실패했습니다.");
    }
  };

  return (
    <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="ml-2">
          저장
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>템플릿 저장</DialogTitle>
          <DialogDescription>
            현재 QR 코드 설정을 템플릿으로 저장합니다.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="template-name">템플릿 이름</Label>
            <Input
              id="template-name"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              placeholder="예: 회사 로고 템플릿"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="default-template"
              checked={isDefault}
              onCheckedChange={setIsDefault}
            />
            <Label htmlFor="default-template">기본 템플릿으로 설정</Label>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setSaveDialogOpen(false)}>
            취소
          </Button>
          <Button onClick={handleSaveTemplate}>저장</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
