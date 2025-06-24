"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { QrCode } from "lucide-react";
import Link from "next/link";
import { useQrCodeDownload } from "./qr-code-download";
import { QrCodeCard } from "./qr-code-card";

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

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <div className="p-6">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="h-32 bg-gray-200 rounded mb-4"></div>
              <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
            </div>
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
          <Link href="/qrcode">
            <Button>첫 번째 QR 코드 만들기</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {qrCodes.map((qrCode) => (
        <QrCodeCard
          key={qrCode.id}
          qrCode={qrCode}
          onToggleFavorite={onToggleFavorite}
          onEdit={onEdit}
          onDelete={onDelete}
          onDownload={handleDownload}
        />
      ))}
    </div>
  );
}
