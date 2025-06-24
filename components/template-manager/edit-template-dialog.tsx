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
import { updateTemplate } from "@/app/actions/qr-code";
import { toast } from "sonner";
import { Template } from "@/types/data-manager";

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

  // 템플릿이 변경될 때 상태 업데이트
  useEffect(() => {
    if (template) {
      setTemplateName(template.name);
    }
  }, [template]);

  const handleUpdateTemplate = async () => {
    if (!template || !templateName.trim()) {
      toast.error("템플릿 이름을 입력해주세요.");
      return;
    }

    try {
      await updateTemplate(template.id, {
        name: templateName,
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
