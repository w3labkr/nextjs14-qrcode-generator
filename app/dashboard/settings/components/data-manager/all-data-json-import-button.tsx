"use client";

import { useState, useRef } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Upload, Database } from "lucide-react";
import { importUserData } from "@/app/actions/data-management";

interface AllDataJSONImportButtonProps {
  disabled?: boolean;
  onImportComplete?: () => void;
}

export default function AllDataJSONImportButton({
  disabled = false,
  onImportComplete,
}: AllDataJSONImportButtonProps) {
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

      // 데이터 구조 검증
      if (!importData.qrCodes) {
        toast.error("올바른 데이터 형식이 아닙니다.");
        return;
      }

      // 데이터 가져오기 실행
      const result = await importUserData({
        qrCodes: importData.qrCodes || [],
        replaceExisting: false,
      });

      toast.success(`데이터 가져오기가 완료되었습니다!`, {
        description: `QR 코드: ${result.imported.qrCodes}개`,
      });

      // 파일 입력 초기화
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      // 가져오기 완료 콜백 실행
      onImportComplete?.();
    } catch (error) {
      console.error("JSON 데이터 가져오기 오류:", error);
      toast.error("데이터 가져오기에 실패했습니다.", {
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
        <Database className="h-4 w-4 mr-2" />
        {isImporting ? "가져오는 중..." : "전체 데이터 가져오기 (JSON)"}
      </Button>
    </>
  );
}
