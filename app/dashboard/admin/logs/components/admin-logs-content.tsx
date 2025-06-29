"use client";

import { useState, useEffect } from "react";
import { UnifiedLogger } from "@/lib/unified-logging";
import type { ApplicationLogData, LogFilterOptions } from "@/types/logs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { DatePickerWithRange } from "@/components/ui/date-picker";
import { DateRange } from "react-day-picker";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import {
  AlertCircle,
  Activity,
  Shield,
  Search,
  RefreshCw,
  FileText,
  Download,
  Eye,
} from "lucide-react";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";

interface AdminLogsContentProps {
  initialData?: ApplicationLogData[];
}

const LOG_TYPE_LABELS = {
  ACCESS: "API 접근",
  AUTH: "인증",
  AUDIT: "감사",
  ERROR: "오류",
  ADMIN: "관리자",
  QR_GENERATION: "QR 생성",
  SYSTEM: "시스템",
};

const LOG_LEVEL_COLORS = {
  DEBUG: "bg-gray-100 text-gray-800",
  INFO: "bg-blue-100 text-blue-800",
  WARN: "bg-yellow-100 text-yellow-800",
  ERROR: "bg-red-100 text-red-800",
  FATAL: "bg-red-200 text-red-900",
};

export function AdminLogsContent({ initialData = [] }: AdminLogsContentProps) {
  const [logs, setLogs] = useState<ApplicationLogData[]>(initialData);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [filters, setFilters] = useState<LogFilterOptions>({
    limit: 50,
    orderBy: "desc" as const,
    page: 1,
  });
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [selectedLog, setSelectedLog] = useState<ApplicationLogData | null>(
    null,
  );
  const { toast } = useToast();

  // 로그 데이터 가져오기
  const fetchLogs = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...filters,
          page: currentPage,
          startDate: dateRange?.from,
          endDate: dateRange?.to,
        }),
      });

      if (!response.ok) {
        throw new Error("로그 데이터를 가져오는데 실패했습니다");
      }

      const data = await response.json();
      setLogs(data.logs || []);
      setTotalCount(data.totalCount || 0);
      setTotalPages(Math.ceil((data.totalCount || 0) / (filters.limit || 50)));
    } catch (error) {
      console.error("로그 가져오기 실패:", error);
      toast({
        title: "오류",
        description: "로그 데이터를 가져오는데 실패했습니다.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // 페이지 변경 함수
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setFilters((prev) => ({ ...prev, page }));
  };

  // 필터 변경 시 첫 페이지로 리셋
  const updateFilters = (newFilters: Partial<LogFilterOptions>) => {
    setCurrentPage(1);
    setFilters((prev) => ({ ...prev, ...newFilters, page: 1 }));
  };

  // CSV 내보내기
  const exportToCsv = () => {
    const headers = ["시간", "타입", "레벨", "액션", "사용자", "IP", "메시지"];
    const csvData = logs.map((log) => [
      log.createdAt
        ? format(new Date(log.createdAt), "yyyy-MM-dd HH:mm:ss")
        : "",
      LOG_TYPE_LABELS[log.type as keyof typeof LOG_TYPE_LABELS] || log.type,
      log.level || "",
      log.action || "",
      log.userId || "",
      log.ipAddress || "",
      log.message || "",
    ]);

    const csvContent = [headers, ...csvData]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `admin-logs-${format(new Date(), "yyyy-MM-dd")}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
    fetchLogs();
  }, [currentPage]);

  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1);
    } else {
      fetchLogs();
    }
  }, [filters.type, filters.level, filters.search, filters.limit, dateRange]);

  return (
    <div className="space-y-6">
      {/* 필터 섹션 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Search className="h-5 w-5" />
            <span>로그 필터링</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 로그 타입 */}
            <div className="space-y-2">
              <Label htmlFor="log-type">로그 타입</Label>{" "}
              <Select
                value={
                  Array.isArray(filters.type)
                    ? filters.type[0]
                    : filters.type || "all"
                }
                onValueChange={(value) =>
                  updateFilters({
                    type: value === "all" ? undefined : (value as any),
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="모든 타입" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">모든 타입</SelectItem>
                  {Object.entries(LOG_TYPE_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 로그 레벨 */}
            <div className="space-y-2">
              <Label htmlFor="log-level">로그 레벨</Label>
              <Select
                value={
                  Array.isArray(filters.level)
                    ? filters.level[0]
                    : filters.level || "all"
                }
                onValueChange={(value) =>
                  updateFilters({
                    level: value === "all" ? undefined : (value as any),
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="모든 레벨" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">모든 레벨</SelectItem>
                  <SelectItem value="DEBUG">DEBUG</SelectItem>
                  <SelectItem value="INFO">INFO</SelectItem>
                  <SelectItem value="WARN">WARN</SelectItem>
                  <SelectItem value="ERROR">ERROR</SelectItem>
                  <SelectItem value="FATAL">FATAL</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 검색어 */}
            <div className="space-y-2">
              <Label htmlFor="search">검색어</Label>
              <Input
                id="search"
                placeholder="메시지나 액션 검색"
                value={filters.search || ""}
                onChange={(e) =>
                  updateFilters({
                    search: e.target.value || undefined,
                  })
                }
              />
            </div>

            {/* 결과 개수 */}
            <div className="space-y-2">
              <Label htmlFor="limit">결과 개수</Label>
              <Select
                value={filters.limit?.toString() || "50"}
                onValueChange={(value) =>
                  updateFilters({ limit: parseInt(value) })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="25">25개</SelectItem>
                  <SelectItem value="50">50개</SelectItem>
                  <SelectItem value="100">100개</SelectItem>
                  <SelectItem value="200">200개</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* 날짜 범위 */}
          <div className="space-y-2">
            <Label>날짜 범위</Label>
            <DatePickerWithRange
              date={dateRange}
              onDateChange={setDateRange}
              className="w-full md:w-auto"
            />
          </div>

          {/* 액션 버튼 */}
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={fetchLogs}
              disabled={loading}
              className="flex items-center space-x-2"
            >
              <RefreshCw
                className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
              />
              <span>새로고침</span>
            </Button>
            <Button
              variant="outline"
              onClick={exportToCsv}
              disabled={logs.length === 0}
              className="flex items-center space-x-2"
            >
              <Download className="h-4 w-4" />
              <span>CSV 내보내기</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 로그 테이블 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>시스템 로그</span>
            <Badge variant="secondary">{totalCount}개</Badge>
          </CardTitle>
          <CardDescription>
            시스템에서 발생한 모든 로그를 확인할 수 있습니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin mr-2" />
              <span>로그를 불러오는 중...</span>
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              조건에 맞는 로그가 없습니다.
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>시간</TableHead>
                    <TableHead>타입</TableHead>
                    <TableHead>레벨</TableHead>
                    <TableHead>액션</TableHead>
                    <TableHead>사용자</TableHead>
                    <TableHead>IP</TableHead>
                    <TableHead>메시지</TableHead>
                    <TableHead>상세</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="font-mono text-sm">
                        {log.createdAt
                          ? format(new Date(log.createdAt), "MM-dd HH:mm:ss", {
                              locale: ko,
                            })
                          : "-"}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {LOG_TYPE_LABELS[
                            log.type as keyof typeof LOG_TYPE_LABELS
                          ] || log.type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {log.level && (
                          <Badge
                            className={
                              LOG_LEVEL_COLORS[
                                log.level as keyof typeof LOG_LEVEL_COLORS
                              ]
                            }
                          >
                            {log.level}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="font-medium">
                        {log.action}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {log.userId || "-"}
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {log.ipAddress || "-"}
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {log.message || "-"}
                      </TableCell>
                      <TableCell>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedLog(log)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>로그 상세 정보</DialogTitle>
                              <DialogDescription>
                                {selectedLog?.createdAt
                                  ? format(
                                      new Date(selectedLog.createdAt),
                                      "yyyy년 MM월 dd일 HH:mm:ss",
                                      { locale: ko },
                                    )
                                  : ""}
                              </DialogDescription>
                            </DialogHeader>
                            <ScrollArea className="max-h-96">
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label>로그 ID</Label>
                                    <div className="font-mono text-sm bg-muted p-2 rounded">
                                      {selectedLog?.id}
                                    </div>
                                  </div>
                                  <div>
                                    <Label>사용자 ID</Label>
                                    <div className="font-mono text-sm bg-muted p-2 rounded">
                                      {selectedLog?.userId || "익명"}
                                    </div>
                                  </div>
                                  <div>
                                    <Label>타입</Label>
                                    <div className="text-sm bg-muted p-2 rounded">
                                      {selectedLog &&
                                        LOG_TYPE_LABELS[
                                          selectedLog.type as keyof typeof LOG_TYPE_LABELS
                                        ]}
                                    </div>
                                  </div>
                                  <div>
                                    <Label>레벨</Label>
                                    <div className="text-sm bg-muted p-2 rounded">
                                      {selectedLog?.level}
                                    </div>
                                  </div>
                                  <div>
                                    <Label>액션</Label>
                                    <div className="text-sm bg-muted p-2 rounded">
                                      {selectedLog?.action}
                                    </div>
                                  </div>
                                  <div>
                                    <Label>카테고리</Label>
                                    <div className="text-sm bg-muted p-2 rounded">
                                      {selectedLog?.category || "-"}
                                    </div>
                                  </div>
                                  <div>
                                    <Label>IP 주소</Label>
                                    <div className="font-mono text-sm bg-muted p-2 rounded">
                                      {selectedLog?.ipAddress || "-"}
                                    </div>
                                  </div>
                                  <div>
                                    <Label>User Agent</Label>
                                    <div className="text-sm bg-muted p-2 rounded break-all">
                                      {selectedLog?.userAgent || "-"}
                                    </div>
                                  </div>
                                </div>

                                <Separator />

                                <div>
                                  <Label>메시지</Label>
                                  <div className="text-sm bg-muted p-3 rounded mt-1">
                                    {selectedLog?.message || "메시지 없음"}
                                  </div>
                                </div>

                                {selectedLog?.metadata && (
                                  <div>
                                    <Label>메타데이터</Label>
                                    <pre className="text-xs bg-muted p-3 rounded mt-1 overflow-auto">
                                      {JSON.stringify(
                                        selectedLog.metadata,
                                        null,
                                        2,
                                      )}
                                    </pre>
                                  </div>
                                )}
                              </div>
                            </ScrollArea>
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* 페이지네이션 */}
          {totalPages > 1 && (
            <div className="mt-6">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() =>
                        currentPage > 1 && handlePageChange(currentPage - 1)
                      }
                      className={
                        currentPage <= 1
                          ? "pointer-events-none opacity-50"
                          : "cursor-pointer"
                      }
                    >
                      이전
                    </PaginationPrevious>
                  </PaginationItem>

                  {/* 페이지 번호들 */}
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum: number;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }

                    return (
                      <PaginationItem key={pageNum}>
                        <PaginationLink
                          onClick={() => handlePageChange(pageNum)}
                          isActive={currentPage === pageNum}
                          className="cursor-pointer"
                        >
                          {pageNum}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  })}

                  <PaginationItem>
                    <PaginationNext
                      onClick={() =>
                        currentPage < totalPages &&
                        handlePageChange(currentPage + 1)
                      }
                      className={
                        currentPage >= totalPages
                          ? "pointer-events-none opacity-50"
                          : "cursor-pointer"
                      }
                    >
                      다음
                    </PaginationNext>
                  </PaginationItem>
                </PaginationContent>
              </Pagination>

              <div className="text-center text-sm text-muted-foreground mt-2">
                페이지 {currentPage} / {totalPages} (총 {totalCount}개)
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
