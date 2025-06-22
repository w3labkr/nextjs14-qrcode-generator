"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { toast } from "sonner";
import { clearQrCodeHistory } from "@/app/actions/qr-code-management";

export default function HistoryClearSection() {
  const [isClearing, setIsClearing] = useState(false);

  const handleClearHistory = async () => {
    setIsClearing(true);

    try {
      const result = await clearQrCodeHistory();

      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.error || "히스토리 초기화에 실패했습니다.");
      }
    } catch (error) {
      console.error("히스토리 초기화 오류:", error);
      toast.error("히스토리 초기화 중 오류가 발생했습니다.");
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>히스토리 초기화</CardTitle>
        <CardDescription>
          저장된 모든 QR 코드 히스토리를 삭제합니다. 이 작업은 되돌릴 수
          없습니다.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" disabled={isClearing}>
              <Trash2 className="mr-2 h-4 w-4" />
              {isClearing ? "초기화 중..." : "히스토리 초기화"}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                정말로 히스토리를 초기화하시겠습니까?
              </AlertDialogTitle>
              <AlertDialogDescription>
                이 작업은 저장된 모든 QR 코드 히스토리를 삭제합니다. 삭제된
                데이터는 복구할 수 없습니다.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>취소</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleClearHistory}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                초기화
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
}
