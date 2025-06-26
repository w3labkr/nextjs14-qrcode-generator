"use client";

import { QR_CODE_TYPES } from "@/lib/constants";
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
import { Heart, Download, Trash2, QrCode, Edit2 } from "lucide-react";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { cn } from "@/lib/utils";

const QR_CODE_TYPE_MAP = {
  URL: { label: "웹사이트", color: "bg-blue-100 text-blue-800" },
  TEXTAREA: { label: "텍스트", color: "bg-green-100 text-green-800" },
  WIFI: { label: "Wi-Fi", color: "bg-orange-100 text-orange-800" },
  EMAIL: { label: "이메일", color: "bg-purple-100 text-purple-800" },
  SMS: { label: "문자메시지", color: "bg-yellow-100 text-yellow-800" },
  VCARD: { label: "연락처", color: "bg-pink-100 text-pink-800" },
  LOCATION: { label: "지도", color: "bg-red-100 text-red-800" },
};

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
  onEdit: (qrCode: QrCodeData) => void;
  onDelete: (id: string) => void;
  onDownload: (qrCode: QrCodeData) => void;
  isEditing?: boolean;
}

export function QrCodeCard({
  qrCode,
  onToggleFavorite,
  onEdit,
  onDelete,
  onDownload,
  isEditing = false,
}: QrCodeCardProps) {
  // 안전한 데이터 검증
  if (!qrCode || !qrCode.id) {
    console.warn("Invalid qrCode data:", qrCode);
    return null;
  }

  const getContentPreview = (content: string, type: string) => {
    if (!content || typeof content !== "string") return "내용 없음";

    if (type === "WIFI") {
      try {
        const wifiData = JSON.parse(content);
        return `SSID: ${wifiData.ssid || "알 수 없음"}`;
      } catch {
        return content.substring(0, 50) + "...";
      }
    }
    return content.length > 50 ? content.substring(0, 50) + "..." : content;
  };

  const getQrCodeColor = (settings: any) => {
    try {
      let parsedSettings = settings;

      // settings가 문자열인 경우 파싱
      if (typeof settings === "string") {
        try {
          parsedSettings = JSON.parse(settings);
        } catch {
          return "#6b7280"; // 파싱 실패시 기본 회색
        }
      }

      // 다양한 형태의 전경색 설정 확인
      if (parsedSettings?.color?.dark) {
        return parsedSettings.color.dark;
      }
      if (parsedSettings?.foregroundColor) {
        return parsedSettings.foregroundColor;
      }
    } catch {
      // settings 파싱에 실패한 경우 기본 색상 반환
    }
    return "#6b7280"; // 기본 회색
  };

  return (
    <Card
      className={cn("group hover:shadow-lg transition-shadow relative", {
        "ring-2 ring-blue-500 ring-offset-2": isEditing,
      })}
    >
      {isEditing && (
        <div className="absolute -top-2 -right-2 z-10">
          <Badge className="bg-blue-500 text-white">편집 중</Badge>
        </div>
      )}
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <Badge
                  variant="secondary"
                  className={
                    QR_CODE_TYPE_MAP[
                      qrCode.type as keyof typeof QR_CODE_TYPE_MAP
                    ]?.color
                  }
                >
                  {QR_CODE_TYPE_MAP[
                    qrCode.type as keyof typeof QR_CODE_TYPE_MAP
                  ]?.label || qrCode.type}
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
            <CardTitle className="text-base line-clamp-2">
              {qrCode.title || "제목 없음"}
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
                  onClick={() => onEdit(qrCode)}
                  className="flex-1 mr-2"
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>편집</TooltipContent>
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
