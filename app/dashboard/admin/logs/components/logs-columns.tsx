"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ApplicationLogData } from "@/types/logs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Eye,
  MoreHorizontal,
  Copy,
  Download,
  AlertTriangle,
  Info,
  CheckCircle,
  XCircle,
  Activity,
} from "lucide-react";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { DataTableColumnHeader } from "./data-table-column-header";

const LOG_TYPE_LABELS = {
  ACCESS: "접근",
  AUTH: "인증",
  AUDIT: "감사",
  ERROR: "오류",
  ADMIN: "관리자",
  QR_GENERATION: "QR생성",
  SYSTEM: "시스템",
} as const;

const ACTION_LABELS = {
  VIEW_LOGS: "시스템 로그 조회",
  LOGIN: "로그인",
  LOGOUT: "로그아웃",
  QR_CODE_GENERATED: "QR 코드 생성",
  QR_CODE_DOWNLOADED: "QR 코드 다운로드",
  USER_CREATED: "사용자 생성",
  USER_UPDATED: "사용자 정보 수정",
  USER_DELETED: "사용자 삭제",
  EXPORT_LOGS: "로그 내보내기",
  DELETE_LOGS: "로그 삭제",
  REFRESH: "토큰 갱신",
  API_ACCESS: "API 접근",
} as const;

const LOG_LEVEL_COLORS = {
  DEBUG: "bg-gray-100 text-gray-800 border-gray-200",
  INFO: "bg-blue-100 text-blue-800 border-blue-200",
  WARN: "bg-yellow-100 text-yellow-800 border-yellow-200",
  ERROR: "bg-red-100 text-red-800 border-red-200",
  FATAL: "bg-red-200 text-red-900 border-red-300",
} as const;

const getStatusIcon = (type: string, level: string) => {
  // 오류 레벨 우선 처리
  if (level === "ERROR" || level === "FATAL") {
    return <XCircle className="h-4 w-4 text-red-500" />;
  }
  if (level === "WARN") {
    return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
  }

  // 타입별 아이콘
  switch (type) {
    case "SYSTEM":
    case "ADMIN":
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    case "AUTH":
      return <CheckCircle className="h-4 w-4 text-blue-500" />;
    case "ACCESS":
      return <Info className="h-4 w-4 text-blue-500" />;
    case "QR_GENERATION":
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    case "AUDIT":
      return <Info className="h-4 w-4 text-gray-500" />;
    default:
      return level === "DEBUG" ? (
        <Activity className="h-4 w-4 text-gray-500" />
      ) : (
        <CheckCircle className="h-4 w-4 text-green-500" />
      );
  }
};

const getStatusText = (type: string, level: string, action?: string) => {
  // 로그 레벨에 따른 상태 결정
  if (level === "ERROR" || level === "FATAL") return "오류";
  if (level === "WARN") return "경고";

  // 액션별 세부 상태 결정
  if (action) {
    switch (action) {
      case "VIEW_LOGS":
        return "로그 조회됨";
      case "LOGIN":
        return "로그인됨";
      case "LOGOUT":
        return "로그아웃됨";
      case "QR_CODE_GENERATED":
        return "QR 생성됨";
      case "QR_CODE_DOWNLOADED":
        return "QR 다운로드됨";
      case "USER_CREATED":
        return "사용자 생성됨";
      case "USER_UPDATED":
        return "사용자 수정됨";
      case "USER_DELETED":
        return "사용자 삭제됨";
      case "EXPORT_LOGS":
        return "로그 내보내기됨";
      case "DELETE_LOGS":
        return "로그 삭제됨";
    }
  }

  // 타입별 기본 상태 결정
  switch (type) {
    case "SYSTEM":
      return "완료";
    case "ADMIN":
      return "실행됨";
    case "AUTH":
      return "인증됨";
    case "ACCESS":
      return "접근됨";
    case "QR_GENERATION":
      return "생성됨";
    case "AUDIT":
      return "기록됨";
    default:
      return "정상";
  }
};

const getPriorityText = (level: string) => {
  switch (level) {
    case "FATAL":
      return "긴급";
    case "ERROR":
      return "높음";
    case "WARN":
      return "보통";
    case "INFO":
      return "보통";
    case "DEBUG":
      return "낮음";
    default:
      return "보통";
  }
};

const getPriorityIcon = (level: string) => {
  switch (level) {
    case "FATAL":
    case "ERROR":
      return "🔴";
    case "WARN":
      return "🟡";
    case "INFO":
      return "🔵";
    case "DEBUG":
      return "⚪";
    default:
      return "🔵";
  }
};

interface LogDetailDialogProps {
  log: ApplicationLogData;
}

function LogDetailDialog({ log }: LogDetailDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
          <Eye className="mr-2 h-4 w-4" />
          상세보기
        </DropdownMenuItem>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <span>로그 상세 정보</span>
            <Badge
              variant="outline"
              className={`text-xs ${log.level && log.level in LOG_LEVEL_COLORS ? LOG_LEVEL_COLORS[log.level as keyof typeof LOG_LEVEL_COLORS] : "bg-gray-100 text-gray-800"}`}
            >
              {log.level || "INFO"}
            </Badge>
          </DialogTitle>
          <DialogDescription>
            로그 ID: {log.id} |{" "}
            {log.createdAt &&
              format(new Date(log.createdAt), "yyyy-MM-dd HH:mm:ss", {
                locale: ko,
              })}
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh]">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <strong className="text-sm font-medium">유형:</strong>
                <Badge
                  variant="outline"
                  className={`ml-2 ${log.type === "ERROR" ? "bg-red-100 text-red-800" : "bg-blue-100 text-blue-800"}`}
                >
                  {LOG_TYPE_LABELS[log.type as keyof typeof LOG_TYPE_LABELS] ||
                    log.type}
                </Badge>
              </div>
              <div>
                <strong className="text-sm font-medium">레벨:</strong>
                <Badge
                  variant="outline"
                  className={`ml-2 ${log.level && log.level in LOG_LEVEL_COLORS ? LOG_LEVEL_COLORS[log.level as keyof typeof LOG_LEVEL_COLORS] : "bg-gray-100 text-gray-800"}`}
                >
                  {log.level || "INFO"}
                </Badge>
              </div>
              <div>
                <strong className="text-sm font-medium">사용자 ID:</strong>
                <p className="text-sm text-muted-foreground">
                  {log.userId || "N/A"}
                </p>
              </div>
            </div>

            <Separator />

            <div>
              <strong className="text-sm font-medium">액션:</strong>
              <p className="mt-1 p-2 bg-muted rounded text-sm">{log.action}</p>
            </div>

            {log.message && (
              <>
                <Separator />
                <div>
                  <strong className="text-sm font-medium">메시지:</strong>
                  <p className="mt-1 p-2 bg-muted rounded text-sm">
                    {log.message}
                  </p>
                </div>
              </>
            )}

            {log.category && (
              <>
                <Separator />
                <div>
                  <strong className="text-sm font-medium">카테고리:</strong>
                  <p className="text-sm text-muted-foreground">
                    {log.category}
                  </p>
                </div>
              </>
            )}

            {log.metadata && (
              <>
                <Separator />
                <div>
                  <strong className="text-sm font-medium">메타데이터:</strong>
                  <pre className="mt-1 p-2 bg-muted rounded text-xs overflow-auto">
                    {JSON.stringify(log.metadata, null, 2)}
                  </pre>
                </div>
              </>
            )}

            {log.ipAddress && (
              <>
                <Separator />
                <div>
                  <strong className="text-sm font-medium">IP 주소:</strong>
                  <p className="text-sm text-muted-foreground font-mono">
                    {log.ipAddress}
                  </p>
                </div>
              </>
            )}

            {log.userAgent && (
              <>
                <Separator />
                <div>
                  <strong className="text-sm font-medium">User Agent:</strong>
                  <p className="text-sm text-muted-foreground break-all">
                    {log.userAgent}
                  </p>
                </div>
              </>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

export const adminLogsColumns: ColumnDef<ApplicationLogData>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="모든 행 선택"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="행 선택"
      />
    ),
    enableSorting: false,
    enableHiding: false,
    size: 40,
  },
  {
    accessorKey: "id",
    header: "로그 ID",
    cell: ({ row }) => {
      const logId = row.getValue("id") as string;
      return (
        <div className="font-mono text-xs text-muted-foreground">
          LOG-{logId?.slice(-4).toUpperCase() || "----"}
        </div>
      );
    },
    size: 80,
  },
  {
    accessorKey: "type",
    header: "제목",
    cell: ({ row }) => {
      const log = row.original;
      const logType = log.type as keyof typeof LOG_TYPE_LABELS;
      const action = log.action;

      return (
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="text-xs">
              {LOG_TYPE_LABELS[logType] || logType}
            </Badge>
            <span className="font-medium text-sm">
              {ACTION_LABELS[action as keyof typeof ACTION_LABELS] || action}
            </span>
          </div>
          {log.message && (
            <p className="text-xs text-muted-foreground line-clamp-2 max-w-[400px]">
              {log.message}
            </p>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "level",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="상태" />
    ),
    cell: ({ row }) => {
      const log = row.original;
      const level = log.level || "INFO";
      const type = log.type;
      const action = log.action;

      return (
        <div className="flex items-center space-x-2">
          {getStatusIcon(type, level)}
          <span className="text-sm">{getStatusText(type, level, action)}</span>
        </div>
      );
    },
    size: 100,
  },
  {
    accessorKey: "level",
    id: "priority",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="우선순위" />
    ),
    cell: ({ row }) => {
      const level = (row.getValue("level") as string) || "INFO";

      return (
        <div className="flex items-center space-x-1">
          <span>{getPriorityIcon(level)}</span>
          <span className="text-sm">{getPriorityText(level)}</span>
        </div>
      );
    },
    size: 100,
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="생성일시" />
    ),
    cell: ({ row }) => {
      const date = row.getValue("createdAt") as Date;
      if (!date) return <span className="text-muted-foreground">-</span>;

      return (
        <div className="text-sm">
          <div>{format(new Date(date), "yyyy-MM-dd", { locale: ko })}</div>
          <div className="text-xs text-muted-foreground">
            {format(new Date(date), "HH:mm:ss", { locale: ko })}
          </div>
        </div>
      );
    },
    size: 120,
  },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => {
      const log = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">메뉴 열기</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[160px]">
            <LogDetailDialog log={log} />
            <DropdownMenuItem
              onClick={() => {
                if (log.id) {
                  navigator.clipboard.writeText(log.id);
                }
              }}
            >
              <Copy className="mr-2 h-4 w-4" />
              ID 복사
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                const logData = JSON.stringify(log, null, 2);
                const blob = new Blob([logData], { type: "application/json" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `log-${log.id || "unknown"}.json`;
                a.click();
                URL.revokeObjectURL(url);
              }}
            >
              <Download className="mr-2 h-4 w-4" />
              다운로드
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
    enableSorting: false,
    enableHiding: false,
    size: 50,
  },
];
