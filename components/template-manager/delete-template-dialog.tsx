"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { deleteTemplate } from "@/app/actions/qr-code";
import { toast } from "sonner";

interface DeleteTemplateDialogProps {
  templateId: string;
  onTemplateDeleted: () => void;
}

export default function DeleteTemplateDialog({
  templateId,
  onTemplateDeleted,
}: DeleteTemplateDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteTemplate = async () => {
    setIsDeleting(true);
    try {
      await deleteTemplate(templateId);
      toast.success("템플릿이 삭제되었습니다!");
      onTemplateDeleted();
    } catch (error) {
      console.error("템플릿 삭제 오류:", error);
      toast.error("템플릿 삭제에 실패했습니다.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          size="sm"
          variant="outline"
          className="text-red-500"
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          삭제
        </Button>
      </AlertDialogTrigger>
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
