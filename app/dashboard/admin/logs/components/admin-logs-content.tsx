"use client";

import { useState, useEffect } from "react";
import axios from "axios";
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
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DatePickerWithRange } from "@/components/ui/date-picker";
import { DateRange } from "react-day-picker";
import { Search, RefreshCw, Download, Settings2 } from "lucide-react";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import { adminLogsColumns } from "./logs-columns";
import { AdminLogsDataTable } from "./admin-logs-data-table";
import { VisibilityState } from "@tanstack/react-table";

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

const getColumnDisplayName = (columnId: string): string => {
  const columnNames: Record<string, string> = {
    id: "로그 ID",
    type: "제목",
    level: "상태",
    priority: "우선순위",
    createdAt: "생성일시",
    actions: "작업",
  };
  return columnNames[columnId] || columnId;
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
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const { toast } = useToast();

  // 로그 데이터 가져오기
  const fetchLogs = async () => {
    setLoading(true);
    try {
      const response = await axios.post("/api/admin/logs", {
        page: currentPage,
        limit,
        type: typeFilter === "ALL" ? undefined : typeFilter,
        level: levelFilter === "ALL" ? undefined : levelFilter,
        search: searchValue || undefined,
        startDate: dateRange?.from,
        endDate: dateRange?.to,
        orderBy: "desc",
      });

      const data = response.data;
      setLogs(data.logs || []);
      setTotalCount(data.totalCount || 0);
      setTotalPages(Math.ceil((data.totalCount || 0) / limit));
    } catch (error) {
      console.error("로그 가져오기 실패:", error);
      const errorMessage = axios.isAxiosError(error)
        ? error.response?.data?.error || error.message
        : error instanceof Error
          ? error.message
          : "로그 데이터를 가져오는데 실패했습니다.";

      toast({
        title: "오류",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // CSV 내보내기
  const exportToCsv = async () => {
    try {
      const response = await axios.post(
        "/api/admin/logs/export",
        {
          type: typeFilter === "ALL" ? undefined : typeFilter,
          level: levelFilter === "ALL" ? undefined : levelFilter,
          search: searchValue || undefined,
          startDate: dateRange?.from,
          endDate: dateRange?.to,
        },
        {
          responseType: "blob",
        },
      );

      const blob = response.data;

      // 파일이 비어있는지 확인
      if (blob.size === 0) {
        throw new Error("내보낼 데이터가 없습니다");
      }

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
      const errorMessage = axios.isAxiosError(error)
        ? error.response?.data?.error || error.message
        : error instanceof Error
          ? error.message
          : "CSV 파일 생성 중 오류가 발생했습니다.";

      toast({
        title: "내보내기 실패",
        description: errorMessage,
        variant: "destructive",
      });
    }
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
            <div className="flex items-center space-x-2">
              <DatePickerWithRange
                date={dateRange}
                onDateChange={setDateRange}
              />

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
            </div>

            <div className="flex items-center space-x-2 lg:ml-auto">
              {/* 검색 필드 */}
              <Input
                placeholder="로그 검색 (액션, 메시지, 사용자 ID...)"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="w-80"
              />

              {/* 컬럼 가시성 토글 */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Settings2 className="mr-2 h-4 w-4" />
                    보기
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[150px]">
                  {adminLogsColumns
                    .filter((column) => column.id && column.id !== "actions")
                    .map((column) => {
                      const columnId = column.id!;
                      return (
                        <DropdownMenuCheckboxItem
                          key={columnId}
                          className="capitalize"
                          checked={columnVisibility[columnId] !== false}
                          onCheckedChange={(value) =>
                            setColumnVisibility((prev) => ({
                              ...prev,
                              [columnId]: value,
                            }))
                          }
                        >
                          {getColumnDisplayName(columnId)}
                        </DropdownMenuCheckboxItem>
                      );
                    })}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* 데이터 테이블 */}
          <AdminLogsDataTable
            columns={adminLogsColumns}
            data={logs}
            loading={loading}
            totalCount={totalCount}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            limit={limit}
            onLimitChange={setLimit}
            columnVisibility={columnVisibility}
            onColumnVisibilityChange={setColumnVisibility}
          />
        </CardContent>
      </Card>
    </div>
  );
}
