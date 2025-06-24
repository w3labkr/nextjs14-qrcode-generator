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
import { saveTemplate } from "@/app/actions/qr-code";
import { QrCodeOptions } from "@/app/actions/qr-code";

interface CreateTemplateDialogProps {
  currentSettings: QrCodeOptions;
  onSaveComplete: () => void;
}

export default function CreateTemplateDialog({
  currentSettings,
  onSaveComplete,
}: CreateTemplateDialogProps) {
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [templateName, setTemplateName] = useState("");

  const handleSaveTemplate = async () => {
    if (!templateName.trim()) {
      toast.error("템플릿 이름을 입력해 주세요.");
      return;
    }

    try {
      await saveTemplate({
        name: templateName,
        settings: currentSettings,
      });

      toast.success("템플릿이 추가되었습니다!");
      setTemplateName("");
      setSaveDialogOpen(false);
      onSaveComplete();
    } catch (error) {
      console.error("템플릿 저장 오류:", error);
      toast.error("템플릿 추가에 실패했습니다.");
    }
  };

  return (
    <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="ml-2">
          추가
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>템플릿 추가</DialogTitle>
          <DialogDescription>
            현재 QR 코드 설정을 템플릿으로 추가합니다.
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
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setSaveDialogOpen(false)}>
            취소
          </Button>
          <Button onClick={handleSaveTemplate}>추가</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
