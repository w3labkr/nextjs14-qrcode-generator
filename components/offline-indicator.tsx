"use client";

import { useOnlineStatus } from "@/hooks/use-online-status";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { WifiOff, Wifi } from "lucide-react";
import { useEffect, useState } from "react";

export function OfflineIndicator() {
  const isOnline = useOnlineStatus();
  const [showOffline, setShowOffline] = useState(false);

  useEffect(() => {
    if (!isOnline) {
      setShowOffline(true);
    } else {
      // 온라인이 되면 잠시 후 숨김
      const timer = setTimeout(() => setShowOffline(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isOnline]);

  if (!showOffline) return null;

  return (
    <Alert
      className={`mb-4 ${isOnline ? "border-green-200 bg-green-50" : "border-orange-200 bg-orange-50"}`}
    >
      <div className="flex items-center gap-2">
        {isOnline ? (
          <Wifi className="h-4 w-4 text-green-600" />
        ) : (
          <WifiOff className="h-4 w-4 text-orange-600" />
        )}
        <AlertDescription
          className={isOnline ? "text-green-800" : "text-orange-800"}
        >
          {isOnline
            ? "인터넷 연결이 복구되었습니다. 모든 기능을 사용할 수 있습니다."
            : "오프라인 상태입니다. 기본적인 QR 코드 생성은 계속 사용 가능합니다."}
        </AlertDescription>
      </div>
    </Alert>
  );
}
