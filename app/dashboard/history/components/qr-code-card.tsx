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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Heart,
  MoreVertical,
  Download,
  Trash2,
  Star,
  QrCode,
  Edit2,
} from "lucide-react";
import { format } from "date-fns";
import { ko } from "date-fns/locale";

const QR_CODE_TYPES = {
  URL: { label: "웹사이트", color: "bg-blue-100 text-blue-800" },
  TEXT: { label: "텍스트", color: "bg-gray-100 text-gray-800" },
  WIFI: { label: "Wi-Fi", color: "bg-green-100 text-green-800" },
  EMAIL: { label: "이메일", color: "bg-purple-100 text-purple-800" },
  SMS: { label: "문자메시지", color: "bg-yellow-100 text-yellow-800" },
  VCARD: { label: "연락처", color: "bg-pink-100 text-pink-800" },
  LOCATION: { label: "위치", color: "bg-red-100 text-red-800" },
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
}

export function QrCodeCard({
  qrCode,
  onToggleFavorite,
  onEdit,
  onDelete,
  onDownload,
}: QrCodeCardProps) {
  const getContentPreview = (content: string, type: string) => {
    if (type === "WIFI") {
      try {
        const wifiData = JSON.parse(content);
        return `SSID: ${wifiData.ssid}`;
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
    <Card className="group hover:shadow-lg transition-shadow">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-2">
              <Badge
                variant="secondary"
                className={
                  QR_CODE_TYPES[qrCode.type as keyof typeof QR_CODE_TYPES]
                    ?.color
                }
              >
                {QR_CODE_TYPES[qrCode.type as keyof typeof QR_CODE_TYPES]
                  ?.label || qrCode.type}
              </Badge>
              {qrCode.isFavorite && (
                <Heart className="h-4 w-4 text-red-500 fill-current" />
              )}
            </div>
            <CardTitle className="text-base line-clamp-2">
              {qrCode.title || "제목 없음"}
            </CardTitle>
            <CardDescription className="text-sm">
              {format(new Date(qrCode.createdAt), "yyyy년 M월 d일", {
                locale: ko,
              })}
            </CardDescription>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onToggleFavorite(qrCode.id)}>
                <Star className="h-4 w-4 mr-2" />
                {qrCode.isFavorite ? "즐겨찾기 해제" : "즐겨찾기 추가"}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDownload(qrCode)}>
                <Download className="h-4 w-4 mr-2" />
                다운로드
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(qrCode)}>
                <Edit2 className="h-4 w-4 mr-2" />
                편집
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-red-600"
                onClick={() => onDelete(qrCode.id)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                삭제
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent>
        <div className="aspect-square bg-white border rounded-lg mb-4 flex items-center justify-center">
          <QrCode
            className="h-24 w-24"
            style={{ color: getQrCodeColor(qrCode.settings) }}
          />
        </div>
        <p className="text-sm text-muted-foreground line-clamp-2">
          {getContentPreview(qrCode.content, qrCode.type)}
        </p>
      </CardContent>
    </Card>
  );
}
