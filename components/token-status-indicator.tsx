"use client";

import { useTokenRefresh } from "@/hooks/use-token-refresh";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, CheckCircle, Clock, RefreshCw } from "lucide-react";
import { useState } from "react";
import { TOKEN_CONFIG } from "@/lib/constants";

export function TokenStatusIndicator() {
  const {
    session,
    isTokenExpiring,
    hasTokenError,
    status,
    refreshToken,
    timeUntilExpiry,
  } = useTokenRefresh();
  const [isManualRefreshing, setIsManualRefreshing] = useState(false);

  if (status === "loading") {
    return null;
  }

  if (!session) {
    return null;
  }

  const getTokenExpiryTime = () => {
    if (timeUntilExpiry <= 0) return "만료됨";

    const minutes = Math.floor(timeUntilExpiry / 60);
    const seconds = timeUntilExpiry % 60;

    if (minutes > 0) {
      return `${minutes}분 ${seconds}초 남음`;
    }
    return `${seconds}초 남음`;
  };

  const handleManualRefresh = async () => {
    setIsManualRefreshing(true);
    try {
      await refreshToken();
    } finally {
      setIsManualRefreshing(false);
    }
  };

  if (hasTokenError) {
    return (
      <div className="flex items-center gap-2">
        <Badge variant="destructive" className="flex items-center gap-1">
          <AlertTriangle className="h-3 w-3" />
          토큰 오류
        </Badge>
        <Button
          size="sm"
          variant="outline"
          onClick={handleManualRefresh}
          disabled={isManualRefreshing}
          className="h-6 px-2"
        >
          <RefreshCw
            className={`h-3 w-3 ${isManualRefreshing ? "animate-spin" : ""}`}
          />
        </Button>
      </div>
    );
  }

  if (isTokenExpiring) {
    return (
      <div className="flex items-center gap-2">
        <Badge variant="secondary" className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {(session as any).rememberMe ? "자동 갱신 중" : "토큰 만료 예정"} (
          {getTokenExpiryTime()})
        </Badge>
        {!(session as any).rememberMe && (
          <Button
            size="sm"
            variant="outline"
            onClick={handleManualRefresh}
            disabled={isManualRefreshing}
            className="h-6 px-2"
            title="수동 갱신"
          >
            <RefreshCw
              className={`h-3 w-3 ${isManualRefreshing ? "animate-spin" : ""}`}
            />
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Badge variant="outline" className="flex items-center gap-1">
        <CheckCircle className="h-3 w-3 text-green-500" />
        토큰 정상 ({getTokenExpiryTime()})
      </Badge>
      {(session as any).rememberMe && (
        <Badge variant="secondary" className="text-xs">
          자동갱신
        </Badge>
      )}
      {timeUntilExpiry <= TOKEN_CONFIG.MANUAL_REFRESH_THRESHOLD && ( // 설정된 시간 이하일 때 수동 갱신 버튼 표시
        <Button
          size="sm"
          variant="ghost"
          onClick={handleManualRefresh}
          disabled={isManualRefreshing}
          className="h-6 px-2"
          title="토큰 수동 갱신"
        >
          <RefreshCw
            className={`h-3 w-3 ${isManualRefreshing ? "animate-spin" : ""}`}
          />
        </Button>
      )}
    </div>
  );
}
