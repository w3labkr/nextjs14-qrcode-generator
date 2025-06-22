"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart } from "lucide-react";
import Link from "next/link";

interface RecentQrCodesProps {
  recentQrCodes: any[];
}

export function RecentQrCodes({ recentQrCodes }: RecentQrCodesProps) {
  const getTypeLabel = (type: string) => {
    const typeMap: { [key: string]: string } = {
      URL: "웹사이트",
      TEXT: "텍스트",
      WIFI: "Wi-Fi",
      EMAIL: "이메일",
      SMS: "문자",
      VCARD: "연락처",
      LOCATION: "지도",
    };
    return typeMap[type] || type;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>최근 생성한 QR 코드</CardTitle>
        <CardDescription>
          최근에 생성한 QR 코드들을 확인해보세요.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {recentQrCodes.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-muted-foreground mb-4">
              아직 생성한 QR 코드가 없습니다.
            </p>
            <Button asChild>
              <Link href="/">첫 QR 코드 만들기</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {recentQrCodes.map((qrCode) => (
              <div
                key={qrCode.id}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium">
                      {qrCode.title || "제목 없음"}
                    </h4>
                    <Badge variant="secondary" className="text-xs">
                      {getTypeLabel(qrCode.type)}
                    </Badge>
                    {qrCode.isFavorite && (
                      <Heart className="h-3 w-3 fill-red-500 text-red-500" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground truncate mt-1">
                    {qrCode.content}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(qrCode.createdAt).toLocaleDateString("ko-KR")}
                  </p>
                </div>
              </div>
            ))}
            <div className="text-center pt-4">
              <Button variant="outline" asChild>
                <Link href="/dashboard/history">모든 히스토리 보기</Link>
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
