"use client";

import { useTokenRefresh } from "@/hooks/use-token-refresh";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle, Clock } from "lucide-react";

export function TokenStatusIndicator() {
  const { session, isTokenExpiring, hasTokenError, status } = useTokenRefresh();

  if (status === "loading") {
    return null;
  }

  if (!session) {
    return null;
  }

  const getTokenExpiryTime = () => {
    if (!session.accessTokenExpires) return null;

    const now = Math.floor(Date.now() / 1000);
    const timeLeft = session.accessTokenExpires - now;

    if (timeLeft <= 0) return "만료됨";

    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;

    if (minutes > 0) {
      return `${minutes}분 ${seconds}초 남음`;
    }
    return `${seconds}초 남음`;
  };

  if (hasTokenError) {
    return (
      <Badge variant="destructive" className="flex items-center gap-1">
        <AlertTriangle className="h-3 w-3" />
        토큰 오류
      </Badge>
    );
  }

  if (isTokenExpiring) {
    return (
      <Badge variant="secondary" className="flex items-center gap-1">
        <Clock className="h-3 w-3" />
        토큰 갱신 중 ({getTokenExpiryTime()})
      </Badge>
    );
  }

  return (
    <Badge variant="outline" className="flex items-center gap-1">
      <CheckCircle className="h-3 w-3" />
      토큰 정상 ({getTokenExpiryTime()})
    </Badge>
  );
}
