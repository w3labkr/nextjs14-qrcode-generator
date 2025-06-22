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
import {
  Upload,
  FileUp,
  AlertTriangle,
  History,
  Layout,
  Database,
} from "lucide-react";
import {
  importUserData,
  importQrCodes,
  importTemplates,
} from "@/app/actions/data-management";
import { toast } from "sonner";
import { ImportStats } from "@/types/data-manager";

type ImportType = "all" | "qrcodes" | "templates";

interface ImportSectionProps {
  onImportComplete: (stats: ImportStats) => void;
}

export default function ImportSection({
  onImportComplete,
}: ImportSectionProps) {
  const [isImporting, setIsImporting] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [importData, setImportData] = useState("");
  const [replaceExisting, setReplaceExisting] = useState(false);
  const [importType, setImportType] = useState<ImportType>("all");

  const validateImportData = (parsedData: any, type: ImportType) => {
    switch (type) {
      case "all":
        return parsedData.qrCodes || parsedData.templates;
      case "qrcodes":
        return (
          parsedData.qrCodes ||
          (parsedData.dataType === "qrcodes" && parsedData.qrCodes)
        );
      case "templates":
        return (
          parsedData.templates ||
          (parsedData.dataType === "templates" && parsedData.templates)
        );
      default:
        return false;
    }
  };

  const getImportTypeLabel = (type: ImportType) => {
    switch (type) {
      case "all":
        return "전체 데이터";
      case "qrcodes":
        return "QR 코드 히스토리";
      case "templates":
        return "템플릿";
      default:
        return "";
    }
  };

  const handleImport = async () => {
    if (!importData.trim()) {
      toast.error("가져올 데이터를 입력해주세요.");
      return;
    }

    try {
      setIsImporting(true);
      const parsedData = JSON.parse(importData);

      if (!validateImportData(parsedData, importType)) {
        throw new Error(
          `올바른 ${getImportTypeLabel(importType)} 형식이 아닙니다.`,
        );
      }

      let result;

      switch (importType) {
        case "all":
          result = await importUserData({
            qrCodes: parsedData.qrCodes || [],
            templates: parsedData.templates || [],
            replaceExisting,
          });
          break;
        case "qrcodes":
          result = await importQrCodes(
            parsedData.qrCodes || [],
            replaceExisting,
          );
          break;
        case "templates":
          result = await importTemplates(
            parsedData.templates || [],
            replaceExisting,
          );
          break;
        default:
          throw new Error("지원하지 않는 가져오기 유형입니다.");
      }

      if (result.success) {
        const importStats: ImportStats = {
          imported: {
            qrCodes: "qrCodes" in result.imported ? result.imported.qrCodes : 0,
            templates:
              "templates" in result.imported ? result.imported.templates : 0,
          },
          total: {
            qrCodes: "qrCodes" in result.total ? result.total.qrCodes : 0,
            templates: "templates" in result.total ? result.total.templates : 0,
          },
        };

        onImportComplete(importStats);

        let successMessage = "";
        if (importType === "all") {
          successMessage = `데이터를 성공적으로 가져왔습니다! (QR 코드: ${importStats.imported.qrCodes}개, 템플릿: ${importStats.imported.templates}개)`;
        } else if (importType === "qrcodes") {
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

      // QR 코드 데이터 검증
      if (parsedData.qrCodes && Array.isArray(parsedData.qrCodes)) {
        for (let i = 0; i < parsedData.qrCodes.length; i++) {
          const qrCode = parsedData.qrCodes[i];
          if (!qrCode.content || typeof qrCode.content !== "string") {
            throw new Error(
              `QR 코드 ${i + 1}번의 content 필드가 유효하지 않습니다.`,
            );
          }
        }
      }

      // 템플릿 데이터 검증
      if (parsedData.templates && Array.isArray(parsedData.templates)) {
        for (let i = 0; i < parsedData.templates.length; i++) {
          const template = parsedData.templates[i];
          if (!template.name || typeof template.name !== "string") {
            throw new Error(
              `템플릿 ${i + 1}번의 name 필드가 유효하지 않습니다.`,
            );
          }
        }
      }

      // 실제 중복 result 변수 정의 제거 (위에서 이미 정의됨)
    } catch (error) {
      console.error("가져오기 오류:", error);
      if (error instanceof SyntaxError) {
        toast.error("JSON 형식이 올바르지 않습니다.");
      } else if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("데이터 가져오기에 실패했습니다.");
      }
    } finally {
      setIsImporting(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/json") {
      toast.error("JSON 파일만 업로드할 수 있습니다.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setImportData(content);
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <FileUp className="h-4 w-4" />
        <h4 className="font-medium">데이터 가져오기</h4>
      </div>
      <p className="text-sm text-muted-foreground">
        내보낸 JSON 파일에서 QR 코드와 템플릿을 가져옵니다.
      </p>

      <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" className="w-full">
            <Upload className="h-4 w-4 mr-2" />
            데이터 가져오기
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>데이터 가져오기</DialogTitle>
            <DialogDescription>
              JSON 파일을 업로드하거나 데이터를 직접 붙여넣으세요.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* 가져오기 유형 선택 */}
            <div>
              <Label className="text-base font-medium">가져오기 유형</Label>
              <RadioGroup
                value={importType}
                onValueChange={(value) => setImportType(value as ImportType)}
                className="mt-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="all" id="all" />
                  <Label
                    htmlFor="all"
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <Database className="h-4 w-4" />
                    전체 데이터 (QR 코드 + 템플릿)
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="qrcodes" id="qrcodes" />
                  <Label
                    htmlFor="qrcodes"
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <History className="h-4 w-4" />
                    QR 코드 히스토리만
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="templates" id="templates" />
                  <Label
                    htmlFor="templates"
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <Layout className="h-4 w-4" />
                    템플릿만
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* 파일 업로드 */}
            <div>
              <Label htmlFor="file-upload">JSON 파일 업로드</Label>
              <Input
                id="file-upload"
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="mt-1"
              />
            </div>

            {/* 또는 구분선 */}
            <div className="flex items-center gap-2">
              <div className="flex-1 border-t" />
              <span className="text-sm text-muted-foreground">또는</span>
              <div className="flex-1 border-t" />
            </div>

            {/* 텍스트 입력 */}
            <div>
              <Label htmlFor="import-data">JSON 데이터 붙여넣기</Label>
              <Textarea
                id="import-data"
                value={importData}
                onChange={(e) => setImportData(e.target.value)}
                placeholder="내보낸 JSON 데이터를 여기에 붙여넣으세요..."
                rows={8}
                className="mt-1 font-mono text-sm"
              />
            </div>

            {/* 옵션 */}
            <div className="flex items-center space-x-2">
              <Switch
                id="replace-existing"
                checked={replaceExisting}
                onCheckedChange={setReplaceExisting}
              />
              <Label htmlFor="replace-existing" className="text-sm">
                기존 데이터 덮어쓰기
                {importType === "all" && " (모든 데이터가 삭제됩니다)"}
                {importType === "qrcodes" && " (기존 QR 코드가 삭제됩니다)"}
                {importType === "templates" && " (기존 템플릿이 삭제됩니다)"}
              </Label>
            </div>

            {replaceExisting && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>주의:</strong> 이 옵션을 선택하면 현재 계정의{" "}
                  {importType === "all" && "모든 QR 코드와 템플릿이"}
                  {importType === "qrcodes" && "모든 QR 코드가"}
                  {importType === "templates" && "모든 템플릿이"} 삭제되고
                  가져오는 데이터로 교체됩니다.
                </AlertDescription>
              </Alert>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setImportDialogOpen(false);
                setImportData("");
                setReplaceExisting(false);
                setImportType("all");
              }}
            >
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
    </div>
  );
}
