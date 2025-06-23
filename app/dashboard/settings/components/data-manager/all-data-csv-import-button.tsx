"use client";

import { useState, useRef } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Upload, Database } from "lucide-react";
import { importQrCodes, importTemplates } from "@/app/actions/data-management";
import { parseQrCodesFromCSV, parseTemplatesFromCSV } from "@/lib/csv-utils";

interface AllDataCSVImportButtonProps {
  disabled?: boolean;
  onImportComplete?: () => void;
}

export default function AllDataCSVImportButton({
  disabled = false,
  onImportComplete,
}: AllDataCSVImportButtonProps) {
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    try {
      setIsImporting(true);

      let totalImportedQrCodes = 0;
      let totalImportedTemplates = 0;

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.type !== "text/csv" && !file.name.endsWith(".csv")) {
          toast.error(`${file.name}은(는) CSV 파일이 아닙니다.`);
          continue;
        }

        const fileContent = await file.text();
        const fileName = file.name.toLowerCase();

        // 파일명에 따라 데이터 타입 결정
        if (fileName.includes("qr-code") || fileName.includes("qrcode")) {
          const qrCodes = parseQrCodesFromCSV(fileContent);
          if (qrCodes.length > 0) {
            const result = await importQrCodes(qrCodes, false);
            totalImportedQrCodes += result.imported.qrCodes;
          }
        } else if (fileName.includes("template")) {
          const templates = parseTemplatesFromCSV(fileContent);
          if (templates.length > 0) {
            const result = await importTemplates(templates, false);
            totalImportedTemplates += result.imported.templates;
          }
        } else {
          // 파일명으로 구분할 수 없는 경우, CSV 구조를 분석해서 판단
          const lines = fileContent.trim().split("\n");
          if (lines.length > 0) {
            const headers = lines[0].toLowerCase();

            if (headers.includes("type") && headers.includes("content")) {
              // QR 코드 CSV로 판단
              const qrCodes = parseQrCodesFromCSV(fileContent);
              if (qrCodes.length > 0) {
                const result = await importQrCodes(qrCodes, false);
                totalImportedQrCodes += result.imported.qrCodes;
              }
            } else if (
              headers.includes("name") &&
              headers.includes("settings")
            ) {
              // 템플릿 CSV로 판단
              const templates = parseTemplatesFromCSV(fileContent);
              if (templates.length > 0) {
                const result = await importTemplates(templates, false);
                totalImportedTemplates += result.imported.templates;
              }
            } else {
              toast.warning(`${file.name}의 데이터 형식을 인식할 수 없습니다.`);
            }
          }
        }
      }

      if (totalImportedQrCodes > 0 || totalImportedTemplates > 0) {
        toast.success(`CSV 데이터 가져오기가 완료되었습니다!`, {
          description: `QR 코드: ${totalImportedQrCodes}개, 템플릿: ${totalImportedTemplates}개`,
        });

        // 가져오기 완료 콜백 실행
        onImportComplete?.();
      } else {
        toast.warning("가져올 수 있는 데이터가 없습니다.");
      }

      // 파일 입력 초기화
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("CSV 데이터 가져오기 오류:", error);
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
        accept=".csv"
        multiple
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
        {isImporting ? "가져오는 중..." : "통합 CSV"}
      </Button>
    </>
  );
}
