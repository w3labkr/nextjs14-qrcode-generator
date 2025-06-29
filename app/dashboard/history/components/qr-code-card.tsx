"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Heart, Download, Trash2, QrCode, Edit } from "lucide-react";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import {
  cn,
  getTypeLabel,
  getTypeColor,
  getContentPreview,
  getQrCodeColor,
} from "@/lib/utils";

interface QrCodeData {
  id: string;
  type: string;
  title: string | null;
  content: string;
  settings: any;
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
}

interface QrCodeCardProps {
  qrCode: QrCodeData;
  onToggleFavorite: (id: string) => void;
  onDelete: (id: string) => void;
  onDownload: (qrCode: QrCodeData) => void;
  onEditTitle: (id: string, currentTitle: string | null) => void;
}

export function QrCodeCard({
  qrCode,
  onToggleFavorite,
  onDelete,
  onDownload,
  onEditTitle,
}: QrCodeCardProps) {
  // 안전한 데이터 검증
  if (!qrCode || !qrCode.id) {
    console.warn("Invalid qrCode data:", qrCode);
    return null;
  }

  return (
    <Card className="group hover:shadow-lg transition-shadow relative">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <Badge
                  variant="outline"
                  className={cn("border-0", getTypeColor(qrCode.type))}
                >
                  {getTypeLabel(qrCode.type)}
                </Badge>
              </div>
              <div className="flex items-center space-x-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-auto h-auto p-0 hover:bg-transparent"
                  onClick={() => onToggleFavorite(qrCode.id)}
                >
                  <Heart
                    className={cn("!size-5 stroke-red-500", {
                      "text-red-500 fill-current": qrCode.isFavorite,
                      "text-gray-400": !qrCode.isFavorite,
                    })}
                  />
                </Button>
              </div>
            </div>
            <CardTitle
              className="text-base line-clamp-2 group-hover:line-clamp-none transition-all duration-200 cursor-pointer flex items-center gap-2"
              onClick={() => onEditTitle(qrCode.id, qrCode.title)}
            >
              {qrCode.title || "제목 없음"}
              <Edit className="h-3 w-3 opacity-0 group-hover:opacity-50 hover:opacity-100 transition-opacity" />
            </CardTitle>
            <CardDescription className="text-sm">
              {(() => {
                try {
                  return format(
                    new Date(qrCode.createdAt),
                    "yyyy년 M월 d일 HH:mm:ss",
                    {
                      locale: ko,
                    },
                  );
                } catch (error) {
                  console.warn("Date formatting error:", error);
                  return "날짜 정보 없음";
                }
              })()}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="aspect-square bg-white border rounded-lg mb-4 flex items-center justify-center">
          <QrCode
            className="h-24 w-24"
            style={{ color: getQrCodeColor(qrCode.settings) }}
          />
        </div>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
          {getContentPreview(qrCode.content, qrCode.type)}
        </p>

        {/* 액션 버튼들 */}
        <TooltipProvider>
          <div className="flex items-center justify-between pt-4 border-t">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onDownload(qrCode)}
                  className="flex-1 mr-2"
                >
                  <Download className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>다운로드</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onDelete(qrCode.id)}
                  className="flex-1 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>삭제</TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>
      </CardContent>
    </Card>
  );
}
