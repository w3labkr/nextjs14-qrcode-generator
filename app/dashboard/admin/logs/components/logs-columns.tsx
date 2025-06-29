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
import { Eye, ArrowUpDown } from "lucide-react";
import { format } from "date-fns";
import { ko } from "date-fns/locale";

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

interface LogDetailDialogProps {
  log: ApplicationLogData;
}

function LogDetailDialog({ log }: LogDetailDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <Eye className="h-4 w-4" />
          <span className="sr-only">로그 상세보기</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>로그 상세 정보</DialogTitle>
          <DialogDescription>
            {log.createdAt &&
              format(new Date(log.createdAt), "PPP p", { locale: ko })}
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh]">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <strong className="text-sm font-medium">로그 ID:</strong>
                <p className="text-sm text-muted-foreground">
                  {log.id || "N/A"}
                </p>
              </div>
              <div>
                <strong className="text-sm font-medium">유형:</strong>
                <Badge
                  variant={log.type === "ERROR" ? "destructive" : "default"}
                  className="ml-2"
                >
                  {LOG_TYPE_LABELS[log.type] || log.type}
                </Badge>
              </div>
              <div>
                <strong className="text-sm font-medium">레벨:</strong>
                <Badge
                  variant="outline"
                  className={`ml-2 ${log.level ? LOG_LEVEL_COLORS[log.level] : "bg-gray-100 text-gray-800"}`}
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
    accessorKey: "createdAt",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-8 px-2"
        >
          시간
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const date = row.getValue("createdAt") as Date;
      if (!date) return <span className="text-muted-foreground">-</span>;
      return (
        <div className="text-sm">
          <div>{format(new Date(date), "MM/dd HH:mm", { locale: ko })}</div>
          <div className="text-xs text-muted-foreground">
            {format(new Date(date), "yyyy", { locale: ko })}
          </div>
        </div>
      );
    },
    size: 100,
  },
  {
    accessorKey: "type",
    header: "유형",
    cell: ({ row }) => {
      const logType = row.getValue("type") as keyof typeof LOG_TYPE_LABELS;
      return (
        <Badge
          variant={logType === "ERROR" ? "destructive" : "default"}
          className="text-xs"
        >
          {LOG_TYPE_LABELS[logType] || logType}
        </Badge>
      );
    },
    size: 80,
  },
  {
    accessorKey: "level",
    header: "레벨",
    cell: ({ row }) => {
      const level = row.getValue("level") as keyof typeof LOG_LEVEL_COLORS;
      return (
        <Badge
          variant="outline"
          className={`text-xs ${level ? LOG_LEVEL_COLORS[level] : "bg-gray-100 text-gray-800"}`}
        >
          {level || "INFO"}
        </Badge>
      );
    },
    size: 70,
  },
  {
    accessorKey: "action",
    header: "액션",
    cell: ({ row }) => {
      const action = row.getValue("action") as string;
      return (
        <div className="max-w-[200px]">
          <p className="text-sm truncate" title={action}>
            {action}
          </p>
        </div>
      );
    },
  },
  {
    accessorKey: "message",
    header: "메시지",
    cell: ({ row }) => {
      const message = row.getValue("message") as string;
      return (
        <div className="max-w-[300px]">
          <p className="text-sm truncate" title={message || ""}>
            {message || "-"}
          </p>
        </div>
      );
    },
  },
  {
    accessorKey: "userId",
    header: "사용자",
    cell: ({ row }) => {
      const userId = row.getValue("userId") as string;
      return (
        <div className="text-sm text-muted-foreground">
          {userId ? (
            <span className="font-mono">{userId.slice(0, 8)}...</span>
          ) : (
            "N/A"
          )}
        </div>
      );
    },
    size: 100,
  },
  {
    accessorKey: "ipAddress",
    header: "IP 주소",
    cell: ({ row }) => {
      const ipAddress = row.getValue("ipAddress") as string;
      return (
        <div className="text-sm text-muted-foreground">
          {ipAddress ? <span className="font-mono">{ipAddress}</span> : "N/A"}
        </div>
      );
    },
    size: 120,
  },
  {
    id: "actions",
    header: "작업",
    cell: ({ row }) => {
      const log = row.original;
      return <LogDetailDialog log={log} />;
    },
    size: 60,
  },
];
