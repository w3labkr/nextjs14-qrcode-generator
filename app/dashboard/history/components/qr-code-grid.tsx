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
import Link from "next/link";
import { useQrCodeDownload } from "./qr-code-download";

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

interface QrCodeGridProps {
  qrCodes: QrCodeData[];
  loading: boolean;
  searchTerm: string;
  selectedType: string;
  showFavorites: boolean;
  onToggleFavorite: (id: string) => void;
  onEdit: (qrCode: QrCodeData) => void;
  onDelete: (id: string) => void;
}

export function QrCodeGrid({
  qrCodes,
  loading,
  searchTerm,
  selectedType,
  showFavorites,
  onToggleFavorite,
  onEdit,
  onDelete,
}: QrCodeGridProps) {
  const { handleDownload } = useQrCodeDownload();

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

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-4">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="h-32 bg-gray-200 rounded mb-4"></div>
              <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (qrCodes.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <QrCode className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">QR 코드가 없습니다</h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm || selectedType !== "all" || showFavorites
              ? "검색 조건에 맞는 QR 코드가 없습니다."
              : "아직 생성한 QR 코드가 없습니다."}
          </p>
          <Link href="/">
            <Button>첫 번째 QR 코드 만들기</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {qrCodes.map((qrCode) => (
        <Card
          key={qrCode.id}
          className="group hover:shadow-lg transition-shadow"
        >
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
                  <DropdownMenuItem onClick={() => handleDownload(qrCode)}>
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
              <QrCode className="h-24 w-24 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {getContentPreview(qrCode.content, qrCode.type)}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
