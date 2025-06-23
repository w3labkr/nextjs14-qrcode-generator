"use client";

import { useState } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { FileText, AlertTriangle } from "lucide-react";
import { importQrCodes, importTemplates } from "@/app/actions/data-management";
import { parseQrCodesFromCSV, parseTemplatesFromCSV } from "@/lib/csv-utils";
import { toast } from "sonner";
import { ImportStats } from "@/types/data-manager";

type CSVImportType = "qrcodes" | "templates";

interface CSVImportButtonProps {
  onImportComplete?: (stats: ImportStats) => void;
}

export default function CSVImportButton({
  onImportComplete,
}: CSVImportButtonProps) {
  const [isImporting, setIsImporting] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [importData, setImportData] = useState("");
  const [replaceExisting, setReplaceExisting] = useState(false);
  const [importType, setImportType] = useState<CSVImportType>("qrcodes");

  const getImportTypeLabel = (type: CSVImportType) => {
    switch (type) {
      case "qrcodes":
        return "QR 코드 히스토리";
      case "templates":
        return "템플릿";
      default:
        return "";
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".csv")) {
      toast.error("CSV 파일만 업로드 가능합니다.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setImportData(content);
    };
    reader.readAsText(file);
  };

  const handleImport = async () => {
    if (!importData.trim()) {
      toast.error("가져올 데이터를 입력해주세요.");
      return;
    }

    try {
      setIsImporting(true);
      let parsedData;

      if (importType === "qrcodes") {
        parsedData = parseQrCodesFromCSV(importData);
      } else if (importType === "templates") {
        parsedData = parseTemplatesFromCSV(importData);
      } else {
        throw new Error("지원하지 않는 가져오기 유형입니다.");
      }

      if (!Array.isArray(parsedData) || parsedData.length === 0) {
        throw new Error(
          `올바른 ${getImportTypeLabel(importType)} CSV 형식이 아닙니다.`,
        );
      }

      let result;

      if (importType === "qrcodes") {
        result = await importQrCodes(parsedData, replaceExisting);
      } else if (importType === "templates") {
        result = await importTemplates(parsedData, replaceExisting);
      }

      if (result && result.success) {
        const importStats: ImportStats = {
          imported: {
            qrCodes:
              importType === "qrcodes"
                ? (result.imported as any).qrCodes || 0
                : 0,
            templates:
              importType === "templates"
                ? (result.imported as any).templates || 0
                : 0,
          },
          total: {
            qrCodes:
              importType === "qrcodes" ? (result.total as any).qrCodes || 0 : 0,
            templates:
              importType === "templates"
                ? (result.total as any).templates || 0
                : 0,
          },
        };

        onImportComplete?.(importStats);

        let successMessage = "";
        if (importType === "qrcodes") {
          successMessage = `QR 코드를 성공적으로 가져왔습니다! (${importStats.imported.qrCodes}개)`;
        } else if (importType === "templates") {
          successMessage = `템플릿을 성공적으로 가져왔습니다! (${importStats.imported.templates}개)`;
        }

        toast.success(successMessage);
        setImportDialogOpen(false);
        setImportData("");
        setReplaceExisting(false);
      } else {
        throw new Error("데이터 가져오기에 실패했습니다.");
      }
    } catch (error) {
      console.error("가져오기 오류:", error);
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("CSV 데이터 가져오기에 실패했습니다.");
      }
    } finally {
      setIsImporting(false);
    }
  };

  const resetDialog = () => {
    setImportDialogOpen(false);
    setImportData("");
    setReplaceExisting(false);
    setImportType("qrcodes");
  };

  return (
    <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          <FileText className="h-4 w-4 mr-2" />
          CSV로 가져오기
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>CSV 데이터 가져오기</DialogTitle>
          <DialogDescription>
            CSV 파일을 업로드하거나 CSV 데이터를 직접 붙여넣어 데이터를 가져올
            수 있습니다.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label className="text-base font-medium">가져올 데이터 유형</Label>
            <RadioGroup
              value={importType}
              onValueChange={(value) => setImportType(value as CSVImportType)}
              className="mt-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="qrcodes" id="qrcodes-csv" />
                <Label htmlFor="qrcodes-csv">QR 코드 히스토리</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="templates" id="templates-csv" />
                <Label htmlFor="templates-csv">템플릿</Label>
              </div>
            </RadioGroup>
          </div>

          <div>
            <Label htmlFor="csv-file-upload">CSV 파일 업로드</Label>
            <Input
              id="csv-file-upload"
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="mt-1"
            />
          </div>

          <div className="flex items-center gap-2">
            <div className="flex-1 border-t" />
            <span className="text-sm text-muted-foreground">또는</span>
            <div className="flex-1 border-t" />
          </div>

          <div>
            <Label htmlFor="csv-import-data">CSV 데이터 붙여넣기</Label>
            <Textarea
              id="csv-import-data"
              value={importData}
              onChange={(e) => setImportData(e.target.value)}
              placeholder="CSV 데이터를 여기에 붙여넣으세요..."
              rows={8}
              className="mt-1 font-mono text-sm"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="csv-replace-existing"
              checked={replaceExisting}
              onCheckedChange={setReplaceExisting}
            />
            <Label htmlFor="csv-replace-existing" className="text-sm">
              기존 데이터 덮어쓰기
              {importType === "qrcodes" && " (기존 QR 코드가 삭제됩니다)"}
              {importType === "templates" && " (기존 템플릿이 삭제됩니다)"}
            </Label>
          </div>

          {replaceExisting && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>주의:</strong> 이 옵션을 선택하면 현재 계정의{" "}
                {importType === "qrcodes" && "모든 QR 코드가"}
                {importType === "templates" && "모든 템플릿이"} 삭제되고
                가져오는 데이터로 교체됩니다.
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={resetDialog}>
            취소
          </Button>
          <Button onClick={handleImport} disabled={isImporting}>
            {isImporting
              ? "가져오는 중..."
              : `${getImportTypeLabel(importType)} 가져오기`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
