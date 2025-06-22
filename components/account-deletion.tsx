"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2, AlertTriangle } from "lucide-react";
import { deleteAccount } from "@/app/actions/qr-code";

export default function AccountDeletion() {
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleDeleteAccount = async () => {
    if (confirmText !== "DELETE") {
      setError("'DELETE'를 정확히 입력해주세요.");
      return;
    }

    setIsDeleting(true);
    setError(null);

    try {
      const result = await deleteAccount();

      if (result.success) {
        // 성공 시 잠시 대기 후 로그아웃
        setTimeout(async () => {
          await signOut({ callbackUrl: "/?deleted=true" });
        }, 1000);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "계정 삭제에 실패했습니다.",
      );
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" className="w-full">
          <Trash2 className="h-4 w-4 mr-2" />
          계정 삭제
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="sm:max-w-[425px]">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            계정 삭제
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-3 text-left">
            <p className="text-red-600 font-medium">
              ⚠️ 이 작업은 되돌릴 수 없습니다!
            </p>
            <p>계정을 삭제하면 다음 데이터가 영구적으로 삭제됩니다:</p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>저장된 모든 QR 코드</li>
              <li>생성한 모든 템플릿</li>
              <li>계정 정보 및 로그인 세션</li>
              <li>모든 개인 설정</li>
            </ul>
            <p className="text-sm text-gray-600">
              이는 GDPR 규정에 따른 완전한 데이터 삭제입니다.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="confirm-delete" className="text-sm font-medium">
              계속하려면 <span className="text-red-600 font-mono">DELETE</span>
              를 입력하세요:
            </Label>
            <Input
              id="confirm-delete"
              value={confirmText}
              onChange={(e) => {
                setConfirmText(e.target.value);
                setError(null);
              }}
              placeholder="DELETE"
              className="mt-1"
              disabled={isDeleting}
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>취소</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleDeleteAccount();
            }}
            disabled={isDeleting || confirmText !== "DELETE"}
            className="bg-red-600 hover:bg-red-700"
          >
            {isDeleting ? "삭제 중..." : "계정 삭제"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
