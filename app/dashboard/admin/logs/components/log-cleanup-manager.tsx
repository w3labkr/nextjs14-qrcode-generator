"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
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
import {
  Trash2,
  BarChart3,
  Calendar,
  RefreshCw,
  AlertTriangle,
  Info,
  Database,
  Clock,
} from "lucide-react";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";

interface LogStats {
  totalLogs: number;
  oldestLog: Date | null;
  newestLog: Date | null;
  retentionDays: number;
  estimatedSize: string;
}

interface CleanupOptions {
  beforeDate: string;
  logTypes: string[];
  logLevels: string[];
  dryRun: boolean;
}

const LOG_TYPES = [
  { value: "ACCESS", label: "API 접근" },
  { value: "AUTH", label: "인증" },
  { value: "AUDIT", label: "감사" },
  { value: "ERROR", label: "오류" },
  { value: "ADMIN", label: "관리자" },
  { value: "QR_GENERATION", label: "QR 생성" },
  { value: "SYSTEM", label: "시스템" },
];

const LOG_LEVELS = [
  { value: "DEBUG", label: "DEBUG" },
  { value: "INFO", label: "INFO" },
  { value: "WARN", label: "WARN" },
  { value: "ERROR", label: "ERROR" },
  { value: "FATAL", label: "FATAL" },
];

export function LogCleanupManager() {
  const [stats, setStats] = useState<LogStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [cleanupLoading, setCleanupLoading] = useState(false);
  const [options, setOptions] = useState<CleanupOptions>({
    beforeDate: "",
    logTypes: [],
    logLevels: [],
    dryRun: true,
  });
  const { toast } = useToast();

  // 통계 데이터 가져오기
  const fetchStats = async () => {
    try {
      const response = await fetch("/api/admin/logs/cleanup");
      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
      }
    } catch (error) {
      console.error("통계 조회 실패:", error);
    } finally {
      setLoading(false);
    }
  };

  // 로그 정리 실행
  const executeCleanup = async () => {
    setCleanupLoading(true);
    try {
      const response = await fetch("/api/admin/logs/cleanup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(options),
      });

      if (!response.ok) {
        throw new Error("로그 정리 실패");
      }

      const data = await response.json();

      toast({
        title: options.dryRun ? "정리 시뮬레이션 완료" : "로그 정리 완료",
        description: `${data.result.deletedCount}개 로그가 ${options.dryRun ? "삭제 예정" : "삭제됨"}`,
      });

      // 통계 새로고침
      await fetchStats();
    } catch (error) {
      console.error("로그 정리 실패:", error);
      toast({
        title: "오류",
        description: "로그 정리에 실패했습니다.",
        variant: "destructive",
      });
    } finally {
      setCleanupLoading(false);
    }
  };

  // 컴포넌트 마운트 시 통계 로드
  useEffect(() => {
    fetchStats();
  }, []);

  // 기본 날짜 설정 (30일 전)
  useEffect(() => {
    if (!options.beforeDate) {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      setOptions((prev) => ({
        ...prev,
        beforeDate: thirtyDaysAgo.toISOString().split("T")[0],
      }));
    }
  }, [options.beforeDate]);

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center space-x-2">
            <RefreshCw className="h-4 w-4 animate-spin" />
            <span>로그 통계를 불러오는 중...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* 로그 통계 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5" />
            <span>로그 저장소 현황</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {stats ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {stats.totalLogs.toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">전체 로그</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {stats.retentionDays}일
                </div>
                <div className="text-sm text-muted-foreground">보존 기간</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{stats.estimatedSize}</div>
                <div className="text-sm text-muted-foreground">예상 크기</div>
              </div>
              <div className="text-center">
                <div className="text-sm font-medium">
                  {stats.oldestLog
                    ? format(new Date(stats.oldestLog), "yyyy-MM-dd", {
                        locale: ko,
                      })
                    : "-"}
                </div>
                <div className="text-sm text-muted-foreground">
                  가장 오래된 로그
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center text-muted-foreground">
              통계를 불러올 수 없습니다.
            </div>
          )}

          <div className="mt-4 flex justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchStats}
              disabled={loading}
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
              />
              새로고침
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 수동 로그 정리 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Trash2 className="h-5 w-5" />
            <span>수동 로그 정리</span>
          </CardTitle>
          <CardDescription>
            특정 조건에 맞는 로그를 수동으로 정리할 수 있습니다.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 날짜 선택 */}
          <div className="space-y-2">
            <Label htmlFor="before-date">다음 날짜 이전의 로그 삭제</Label>
            <Input
              id="before-date"
              type="date"
              value={options.beforeDate}
              onChange={(e) =>
                setOptions((prev) => ({ ...prev, beforeDate: e.target.value }))
              }
            />
          </div>

          <Separator />

          {/* 로그 타입 선택 */}
          <div className="space-y-3">
            <Label>로그 타입 (선택사항)</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {LOG_TYPES.map((type) => (
                <div key={type.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`type-${type.value}`}
                    checked={options.logTypes.includes(type.value)}
                    onCheckedChange={(checked) => {
                      setOptions((prev) => ({
                        ...prev,
                        logTypes: checked
                          ? [...prev.logTypes, type.value]
                          : prev.logTypes.filter((t) => t !== type.value),
                      }));
                    }}
                  />
                  <Label htmlFor={`type-${type.value}`} className="text-sm">
                    {type.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* 로그 레벨 선택 */}
          <div className="space-y-3">
            <Label>로그 레벨 (선택사항)</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {LOG_LEVELS.map((level) => (
                <div key={level.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`level-${level.value}`}
                    checked={options.logLevels.includes(level.value)}
                    onCheckedChange={(checked) => {
                      setOptions((prev) => ({
                        ...prev,
                        logLevels: checked
                          ? [...prev.logLevels, level.value]
                          : prev.logLevels.filter((l) => l !== level.value),
                      }));
                    }}
                  />
                  <Label htmlFor={`level-${level.value}`} className="text-sm">
                    {level.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* 드라이런 모드 */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>시뮬레이션 모드</Label>
              <div className="text-sm text-muted-foreground">
                실제 삭제하지 않고 삭제될 로그 수만 확인합니다.
              </div>
            </div>
            <Switch
              checked={options.dryRun}
              onCheckedChange={(checked) =>
                setOptions((prev) => ({ ...prev, dryRun: checked }))
              }
            />
          </div>

          {/* 실행 버튼 */}
          <div className="flex items-center space-x-4 pt-4">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant={options.dryRun ? "outline" : "destructive"}
                  disabled={cleanupLoading || !options.beforeDate}
                  className="flex items-center space-x-2"
                >
                  {cleanupLoading ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : options.dryRun ? (
                    <Info className="h-4 w-4" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                  <span>
                    {cleanupLoading
                      ? "처리 중..."
                      : options.dryRun
                        ? "시뮬레이션 실행"
                        : "로그 삭제"}
                  </span>
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    {options.dryRun ? "시뮬레이션 실행" : "로그 삭제 확인"}
                  </AlertDialogTitle>
                  <AlertDialogDescription asChild>
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-0.5">
                        {options.dryRun ? (
                          <Info className="h-5 w-5 text-blue-500" />
                        ) : (
                          <AlertTriangle className="h-5 w-5 text-red-500" />
                        )}
                      </div>
                      <div className="space-y-2">
                        <div>
                          {options.dryRun
                            ? "삭제될 로그 수를 확인합니다. 실제 삭제는 수행되지 않습니다."
                            : "선택한 조건에 맞는 로그가 영구적으로 삭제됩니다. 이 작업은 되돌릴 수 없습니다."}
                        </div>
                        <div className="space-y-1 text-sm">
                          <div>• 기준 날짜: {options.beforeDate}</div>
                          {options.logTypes.length > 0 && (
                            <div>
                              • 로그 타입: {options.logTypes.join(", ")}
                            </div>
                          )}
                          {options.logLevels.length > 0 && (
                            <div>
                              • 로그 레벨: {options.logLevels.join(", ")}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>취소</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={executeCleanup}
                    className={
                      options.dryRun
                        ? ""
                        : "bg-destructive hover:bg-destructive/90"
                    }
                  >
                    {options.dryRun ? "시뮬레이션 실행" : "삭제 실행"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            {!options.dryRun && (
              <div className="flex items-center space-x-1 text-sm text-destructive">
                <AlertTriangle className="h-4 w-4" />
                <span>실제 삭제 모드입니다!</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 자동 정리 안내 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="h-5 w-5" />
            <span>자동 로그 정리</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex items-center space-x-2">
              <Badge variant="outline">INFO</Badge>
              <span>
                매일 오전 2시에 자동으로 {stats?.retentionDays}일 이전의 로그가
                삭제됩니다.
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="outline">설정</Badge>
              <span>
                보존 기간은 환경변수 LOG_RETENTION_DAYS로 설정할 수 있습니다.
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="outline">실행</Badge>
              <span>크론잡은 Vercel의 Cron Jobs 기능을 사용합니다.</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
