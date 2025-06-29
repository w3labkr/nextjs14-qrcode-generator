"use client";

import { useState, useEffect } from "react";
import { ApplicationLogData } from "@/types/logs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  ACCESS: "접근",
  AUTH: "인증",
  AUDIT: "감사",
  ERROR: "오류",
  ADMIN: "관리자",
  QR_GENERATION: "QR생성",
  SYSTEM: "시스템",
};

export function AdminLogsContent({ initialData = [] }: AdminLogsContentProps) {
  const [logs, setLogs] = useState<ApplicationLogData[]>(initialData);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [searchValue, setSearchValue] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [levelFilter, setLevelFilter] = useState("ALL");
  const [limit, setLimit] = useState(10);
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
          page: currentPage,
          limit,
          type: typeFilter === "ALL" ? undefined : typeFilter,
          level: levelFilter === "ALL" ? undefined : levelFilter,
          search: searchValue || undefined,
          startDate: dateRange?.from,
          endDate: dateRange?.to,
          orderBy: "desc",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || "로그 데이터를 가져오는데 실패했습니다",
        );
      }

      const data = await response.json();
      setLogs(data.logs || []);
      setTotalCount(data.totalCount || 0);
      setTotalPages(Math.ceil((data.totalCount || 0) / limit));
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

  // CSV 내보내기
  const exportToCsv = async () => {
    try {
      const response = await fetch("/api/admin/logs/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: typeFilter === "ALL" ? undefined : typeFilter,
          level: levelFilter === "ALL" ? undefined : levelFilter,
          search: searchValue || undefined,
          startDate: dateRange?.from,
          endDate: dateRange?.to,
        }),
      });

      if (!response.ok) {
        throw new Error("CSV 내보내기에 실패했습니다");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = `logs-${format(new Date(), "yyyy-MM-dd-HHmm", { locale: ko })}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "내보내기 완료",
        description: "로그 데이터가 CSV 파일로 다운로드되었습니다.",
      });
    } catch (error) {
      console.error("CSV 내보내기 실패:", error);
      toast({
        title: "내보내기 실패",
        description: "CSV 파일 생성 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  };

  // 페이지 변경 핸들러
  const handlePageChange = (page: number) => {
    setCurrentPage(page + 1);
  };

  // 페이지네이션 객체
  const paginationConfig = {
    pageIndex: currentPage - 1,
    pageSize: limit,
    pageCount: totalPages,
    onPageChange: handlePageChange,
    canPreviousPage: currentPage > 1,
    canNextPage: currentPage < totalPages,
  };

  useEffect(() => {
    fetchLogs();
  }, [currentPage, limit, typeFilter, levelFilter, searchValue, dateRange]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="flex items-center space-x-2">
                <Search className="h-5 w-5" />
                <span>시스템 로그</span>
                <Badge variant="secondary" className="ml-2">
                  {totalCount}개 항목
                </Badge>
              </CardTitle>
              <CardDescription>
                시스템 로그를 테이블 형태로 관리하고 필터링할 수 있습니다.
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Button onClick={exportToCsv} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                CSV 내보내기
              </Button>
              <Button onClick={fetchLogs} disabled={loading} size="sm">
                <RefreshCw
                  className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
                />
                새로고침
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* 상단 필터 바 */}
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            <div className="flex-1">
              <Input
                placeholder="로그 검색 (액션, 메시지, 사용자 ID...)"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="max-w-md"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="유형 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">전체 유형</SelectItem>
                  {Object.entries(LOG_TYPE_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={levelFilter} onValueChange={setLevelFilter}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="레벨" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">전체 레벨</SelectItem>
                  <SelectItem value="DEBUG">디버그</SelectItem>
                  <SelectItem value="INFO">정보</SelectItem>
                  <SelectItem value="WARN">경고</SelectItem>
                  <SelectItem value="ERROR">오류</SelectItem>
                  <SelectItem value="FATAL">치명적</SelectItem>
                </SelectContent>
              </Select>

              <DatePickerWithRange
                date={dateRange}
                onDateChange={setDateRange}
              />

              <Select
                value={limit.toString()}
                onValueChange={(value) => setLimit(parseInt(value))}
              >
                <SelectTrigger className="w-[100px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10개</SelectItem>
                  <SelectItem value="25">25개</SelectItem>
                  <SelectItem value="50">50개</SelectItem>
                  <SelectItem value="100">100개</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* 데이터 테이블 */}
          <DataTable
            columns={adminLogsColumns}
            data={logs}
            loading={loading}
            pagination={paginationConfig}
            searchKey="action"
            searchPlaceholder="로그 검색..."
            onSearchChange={setSearchValue}
          />
        </CardContent>
      </Card>
    </div>
  );
}
