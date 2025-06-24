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
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateTemplate } from "@/app/actions/qr-code";
import { toast } from "sonner";
import { Template } from "@/types/data-manager";

interface EditTemplateDialogProps {
  template: Template;
  onUpdateComplete: () => void;
}

export default function EditTemplateDialog({
  template,
  onUpdateComplete,
}: EditTemplateDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [templateName, setTemplateName] = useState(template.name);

  useEffect(() => {
    if (template) {
      setTemplateName(template.name);
    }
  }, [template]);

  const handleUpdateTemplate = async () => {
    if (!templateName.trim()) {
      toast.error("템플릿 이름을 입력해주세요.");
      return;
    }

    try {
      await updateTemplate(template.id, {
        name: templateName,
      });

      toast.success("템플릿이 업데이트되었습니다!");
      setIsOpen(false);
      onUpdateComplete();
    } catch (error) {
      console.error("템플릿 업데이트 오류:", error);
      toast.error("템플릿 업데이트에 실패했습니다.");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          variant="outline"
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          수정
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>템플릿 수정</DialogTitle>
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
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            취소
          </Button>
          <Button onClick={handleUpdateTemplate}>저장</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
