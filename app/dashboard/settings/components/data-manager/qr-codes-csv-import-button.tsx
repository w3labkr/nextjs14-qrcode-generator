"use client";

import { useState, useRef } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Upload, QrCode } from "lucide-react";
import { importUserData } from "@/app/actions/data-management";
import { parseQrCodesFromCSV } from "@/lib/csv-utils";

interface QrCodesCSVImportButtonProps {
  disabled?: boolean;
  onImportComplete?: () => void;
}

export default function QrCodesCSVImportButton({
  disabled = false,
  onImportComplete,
}: QrCodesCSVImportButtonProps) {
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

    if (!file.name.toLowerCase().endsWith(".csv")) {
      toast.error("CSV 파일만 업로드 가능합니다.");
      return;
    }

    try {
      setIsImporting(true);

      const fileContent = await file.text();
      const csvData = parseQrCodesFromCSV(fileContent);

      if (csvData.length === 0) {
        toast.error("CSV 파일에 데이터가 없습니다.");
        return;
      }

      // CSV 데이터가 이미 올바른 형식이므로 바로 사용
      const qrCodes = csvData.filter((qr: any) => qr.content); // content가 있는 것만 필터링

      if (qrCodes.length === 0) {
        toast.error("유효한 QR 코드 데이터가 없습니다.");
        return;
      }

      // QR 코드만 가져오기 실행
      const result = await importUserData({
        qrCodes: qrCodes,
        templates: [],
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
      console.error("QR 코드 CSV 가져오기 오류:", error);
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
        accept=".csv"
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
        {isImporting ? "가져오는 중..." : "QR 코드 가져오기 (CSV)"}
      </Button>
    </>
  );
}
