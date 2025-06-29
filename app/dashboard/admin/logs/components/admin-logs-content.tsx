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
import { Search, RefreshCw, Download } from "lucide-react";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import { DataTable } from "@/components/ui/data-table";
import { adminLogsColumns } from "./logs-columns";

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
        const errorData = await response.json().catch(() => ({}));
        console.error("API 응답 에러:", {
          status: response.status,
          statusText: response.statusText,
          errorData,
        });
        throw new Error(
          errorData.error || "로그 데이터를 가져오는데 실패했습니다",
        );
      }

      const data = await response.json();
      console.log("로그 데이터 응답:", data);
      setLogs(data.logs || []);
      setTotalCount(data.totalCount || 0);
      setTotalPages(Math.ceil((data.totalCount || 0) / (filters.limit || 50)));
    } catch (error) {
      console.error("로그 가져오기 실패:", error);
      toast({
        title: "오류",
        description:
          error instanceof Error
            ? error.message
            : "로그 데이터를 가져오는데 실패했습니다.",
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

  // 검색 핸들러
  const handleSearch = (value: string) => {
    updateFilters({ search: value || undefined });
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
              <Label htmlFor="log-type">로그 타입</Label>
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

            {/* 페이지당 항목 수 */}
            <div className="space-y-2">
              <Label htmlFor="page-size">페이지당 항목</Label>
              <Select
                value={String(filters.limit)}
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

            {/* 새로고침 버튼 */}
            <div className="space-y-2">
              <Label>&nbsp;</Label>
              <Button
                onClick={fetchLogs}
                disabled={loading}
                className="w-full"
                variant="outline"
              >
                <RefreshCw
                  className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
                />
                새로고침
              </Button>
            </div>
          </div>

          {/* 검색 및 날짜 범위 */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="search">검색</Label>
              <Input
                id="search"
                placeholder="메시지 또는 액션 검색..."
                value={filters.search || ""}
                onChange={(e) => handleSearch(e.target.value)}
                className="mt-2"
              />
            </div>
            <div className="min-w-[300px]">
              <Label>날짜 범위</Label>
              <div className="mt-2">
                <DatePickerWithRange
                  date={dateRange}
                  onDateChange={setDateRange}
                />
              </div>
            </div>
          </div>

          {/* 액션 버튼 */}
          <div className="flex justify-between items-center pt-4 border-t">
            <div className="text-sm text-muted-foreground">
              총 {totalCount.toLocaleString()}개의 로그
            </div>
            <Button onClick={exportToCsv} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              CSV 내보내기
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 데이터 테이블 */}
      <Card>
        <CardHeader>
          <CardTitle>시스템 로그</CardTitle>
          <CardDescription>
            최근 로그 데이터를 테이블 형태로 확인할 수 있습니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={adminLogsColumns}
            data={logs}
            searchKey="action"
            searchPlaceholder="액션 검색..."
            loading={loading}
            pagination={{
              pageIndex: currentPage - 1,
              pageSize: filters.limit || 50,
              pageCount: totalPages,
              onPageChange: (page) => handlePageChange(page + 1),
              canPreviousPage: currentPage > 1,
              canNextPage: currentPage < totalPages,
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
