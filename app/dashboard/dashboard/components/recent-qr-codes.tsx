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
import { QR_CODE_TYPES } from "@/lib/constants";
import { truncateContent, getTypeLabel } from "@/lib/utils";

interface RecentQrCodesProps {
  recentQrCodes: any[];
}

export function RecentQrCodes({ recentQrCodes }: RecentQrCodesProps) {
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
              <Link href="/qrcode">첫 QR 코드 만들기</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {recentQrCodes.map((qrCode) => (
              <div
                key={qrCode.id}
                className="flex items-start p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h4
                      className="font-medium truncate max-w-[150px] sm:max-w-[200px]"
                      title={qrCode.title || "제목 없음"}
                    >
                      {qrCode.title || "제목 없음"}
                    </h4>
                    <Badge
                      variant="secondary"
                      className="text-xs flex-shrink-0"
                    >
                      {getTypeLabel(qrCode.type)}
                    </Badge>
                    {qrCode.isFavorite && (
                      <Heart className="h-3 w-3 fill-red-500 text-red-500 flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1 break-all">
                    {truncateContent(qrCode.content)}
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
