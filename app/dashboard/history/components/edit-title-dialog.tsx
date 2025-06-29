"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface EditTitleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentTitle: string | null;
  onConfirm: (newTitle: string) => void;
  loading?: boolean;
}

export function EditTitleDialog({
  open,
  onOpenChange,
  currentTitle,
  onConfirm,
  loading = false,
}: EditTitleDialogProps) {
  const [title, setTitle] = useState(currentTitle || "");

  // currentTitle이 변경될 때 상태 업데이트
  useEffect(() => {
    setTitle(currentTitle || "");
  }, [currentTitle]);

  const handleConfirm = () => {
    onConfirm(title.trim());
    onOpenChange(false);
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen) {
      setTitle(currentTitle || "");
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>제목 수정</DialogTitle>
          <DialogDescription>
            QR 코드의 제목을 수정하실 수 있습니다.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="title" className="text-right">
              제목
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="col-span-3"
              placeholder="제목을 입력하세요"
              maxLength={100}
              disabled={loading}
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            취소
          </Button>
          <Button type="button" onClick={handleConfirm} disabled={loading}>
            {loading ? "수정 중..." : "수정"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
