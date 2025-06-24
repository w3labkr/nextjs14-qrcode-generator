"use client";

import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { deleteTemplate } from "@/app/actions/qr-code";
import { toast } from "sonner";

interface DeleteTemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  templateId: string | null;
  onTemplateDeleted: () => void;
}

export default function DeleteTemplateDialog({
  open,
  onOpenChange,
  templateId,
  onTemplateDeleted,
}: DeleteTemplateDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteTemplate = async () => {
    if (!templateId) return;

    setIsDeleting(true);
    try {
      await deleteTemplate(templateId);
      toast.success("템플릿이 삭제되었습니다!");
      onTemplateDeleted();
      onOpenChange(false);
    } catch (error) {
      console.error("템플릿 삭제 오류:", error);
      toast.error("템플릿 삭제에 실패했습니다.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>템플릿 삭제</AlertDialogTitle>
          <AlertDialogDescription>
            정말로 이 템플릿을 삭제하시겠습니까? 삭제된 템플릿은 복구할 수
            없습니다.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>취소</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDeleteTemplate}
            disabled={isDeleting}
            className="bg-red-500 hover:bg-red-600"
          >
            {isDeleting ? "삭제 중..." : "삭제"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
