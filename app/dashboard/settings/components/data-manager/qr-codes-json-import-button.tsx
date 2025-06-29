"use client";

import { useState, useRef } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Upload, QrCode } from "lucide-react";
import { importUserData } from "@/app/actions/data-management";

interface QrCodesJSONImportButtonProps {
  disabled?: boolean;
  onImportComplete?: () => void;
}

export default function QrCodesJSONImportButton({
  disabled = false,
  onImportComplete,
}: QrCodesJSONImportButtonProps) {
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/json") {
      toast.error("JSON 파일만 업로드 가능합니다.");
      return;
    }

    try {
      setIsImporting(true);

      const fileContent = await file.text();
      const importData = JSON.parse(fileContent);

      // QR 코드 데이터 검증
      let qrCodes = [];
      if (importData.qrCodes && Array.isArray(importData.qrCodes)) {
        qrCodes = importData.qrCodes;
      } else if (
        importData.dataType === "qr-codes" &&
        Array.isArray(importData.qrCodes)
      ) {
        qrCodes = importData.qrCodes;
      } else if (Array.isArray(importData)) {
        // 직접 QR 코드 배열인 경우
        qrCodes = importData;
      } else {
        toast.error("올바른 QR 코드 데이터 형식이 아닙니다.");
        return;
      }

      if (qrCodes.length === 0) {
        toast.error("가져올 QR 코드 데이터가 없습니다.");
        return;
      }

      // QR 코드만 가져오기 실행
      const result = await importUserData({
        qrCodes: qrCodes,
        replaceExisting: false,
      });

      toast.success(`QR 코드 가져오기가 완료되었습니다!`, {
        description: `${result.imported.qrCodes}개의 QR 코드를 가져왔습니다.`,
      });

      // 파일 입력 초기화
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      // 가져오기 완료 콜백 실행
      onImportComplete?.();
    } catch (error) {
      console.error("QR 코드 JSON 가져오기 오류:", error);
      toast.error("QR 코드 가져오기에 실패했습니다.", {
        description:
          error instanceof Error ? error.message : "파일 형식을 확인해주세요.",
      });
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleFileChange}
        className="hidden"
      />
      <Button
        onClick={handleFileSelect}
        disabled={disabled || isImporting}
        variant="outline"
        className="w-full"
      >
        <QrCode className="h-4 w-4 mr-2" />
        {isImporting ? "가져오는 중..." : "QR 코드 가져오기 (JSON)"}
      </Button>
    </>
  );
}
