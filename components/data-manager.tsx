"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import {
  Download,
  Upload,
  FileDown,
  FileUp,
  AlertTriangle,
} from "lucide-react";
import { exportUserData, importUserData } from "@/app/actions/qr-code";
import { toast } from "sonner";

interface ImportStats {
  imported: {
    qrCodes: number;
    templates: number;
  };
  total: {
    qrCodes: number;
    templates: number;
  };
}

export default function DataManager() {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [importData, setImportData] = useState("");
  const [replaceExisting, setReplaceExisting] = useState(false);
  const [importStats, setImportStats] = useState<ImportStats | null>(null);

  const handleExport = async () => {
    try {
      setIsExporting(true);
      const data = await exportUserData();

      // JSON 파일로 다운로드
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `qr-data-export-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success(
        `데이터가 성공적으로 내보내졌습니다! (QR 코드: ${data.stats.totalQrCodes}개, 템플릿: ${data.stats.totalTemplates}개)`,
      );
    } catch (error) {
      console.error("내보내기 오류:", error);
      toast.error("데이터 내보내기에 실패했습니다.");
    } finally {
      setIsExporting(false);
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

      // 데이터 형식 검증
      if (!parsedData.qrCodes && !parsedData.templates) {
        throw new Error("올바른 형식의 데이터가 아닙니다.");
      }

      const result = await importUserData({
        qrCodes: parsedData.qrCodes || [],
        templates: parsedData.templates || [],
        replaceExisting,
      });

      setImportStats(result);

      toast.success(
        `데이터를 성공적으로 가져왔습니다! (QR 코드: ${result.imported.qrCodes}/${result.total.qrCodes}개, 템플릿: ${result.imported.templates}/${result.total.templates}개)`,
      );

      setImportData("");
      setImportDialogOpen(false);
    } catch (error) {
      console.error("가져오기 오류:", error);
      if (error instanceof SyntaxError) {
        toast.error("JSON 형식이 올바르지 않습니다.");
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
    <Card>
      <CardHeader>
        <CardTitle>데이터 관리</CardTitle>
        <CardDescription>
          QR 코드와 템플릿 데이터를 내보내거나 가져올 수 있습니다.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 내보내기 섹션 */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <FileDown className="h-4 w-4" />
            <h4 className="font-medium">데이터 내보내기</h4>
          </div>
          <p className="text-sm text-muted-foreground">
            모든 QR 코드와 템플릿을 JSON 파일로 다운로드합니다.
          </p>
          <Button
            onClick={handleExport}
            disabled={isExporting}
            className="w-full"
          >
            <Download className="h-4 w-4 mr-2" />
            {isExporting ? "내보내는 중..." : "데이터 내보내기"}
          </Button>
        </div>

        <div className="border-t pt-4">
          {/* 가져오기 섹션 */}
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
                      기존 데이터 덮어쓰기 (기존 데이터가 모두 삭제됩니다)
                    </Label>
                  </div>

                  {replaceExisting && (
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        <strong>주의:</strong> 이 옵션을 선택하면 현재 계정의
                        모든 QR 코드와 템플릿이 삭제되고 가져오는 데이터로
                        교체됩니다.
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
                    }}
                  >
                    취소
                  </Button>
                  <Button onClick={handleImport} disabled={isImporting}>
                    {isImporting ? "가져오는 중..." : "데이터 가져오기"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* 가져오기 결과 표시 */}
        {importStats && (
          <div className="border-t pt-4">
            <div className="space-y-2">
              <h4 className="font-medium text-green-600">가져오기 완료</h4>
              <div className="text-sm space-y-1">
                <p>
                  • QR 코드: {importStats.imported.qrCodes}/
                  {importStats.total.qrCodes}개 가져옴
                </p>
                <p>
                  • 템플릿: {importStats.imported.templates}/
                  {importStats.total.templates}개 가져옴
                </p>
              </div>
              {(importStats.imported.qrCodes < importStats.total.qrCodes ||
                importStats.imported.templates <
                  importStats.total.templates) && (
                <p className="text-xs text-muted-foreground">
                  일부 항목은 중복되거나 오류로 인해 가져오지 못했을 수
                  있습니다.
                </p>
              )}
            </div>
          </div>
        )}

        {/* 사용 안내 */}
        <div className="border-t pt-4">
          <div className="space-y-2">
            <h4 className="font-medium">사용 방법</h4>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>• 내보내기: 현재 계정의 모든 데이터를 JSON 파일로 저장</p>
              <p>• 가져오기: 다른 계정에서 내보낸 데이터를 현재 계정에 추가</p>
              <p>• 백업: 정기적으로 데이터를 내보내서 백업으로 보관</p>
              <p>• 마이그레이션: 계정 간 데이터 이동 시 활용</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
