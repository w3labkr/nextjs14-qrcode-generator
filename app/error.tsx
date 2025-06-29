"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { logErrorAction } from "@/app/actions";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // 에러 로그 기록
    const logError = async () => {
      try {
        await logErrorAction({
          error: `글로벌 에러: ${error.message} | Digest: ${error.digest || "N/A"} | Stack: ${error.stack || "N/A"}`,
        });
      } catch (logError) {
        console.error("에러 로그 기록 실패:", logError);
      }
    };

    logError();
    console.error("글로벌 에러 발생:", error);
  }, [error]);

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center space-y-4">
      <div className="text-center">
        <h2 className="text-2xl font-bold">문제가 발생했습니다!</h2>
        <p className="text-gray-600 mt-2">
          예상치 못한 오류가 발생했습니다. 잠시 후 다시 시도해주세요.
        </p>
        {process.env.NODE_ENV === "development" && (
          <details className="mt-4 p-4 bg-gray-100 rounded text-left text-sm">
            <summary className="cursor-pointer font-medium">
              에러 상세정보
            </summary>
            <pre className="mt-2 whitespace-pre-wrap">{error.message}</pre>
            {error.digest && (
              <p className="mt-2">
                <strong>Digest:</strong> {error.digest}
              </p>
            )}
          </details>
        )}
      </div>
      <div className="flex space-x-2">
        <Button onClick={reset}>다시 시도</Button>
        <Button variant="outline" onClick={() => (window.location.href = "/")}>
          홈으로 돌아가기
        </Button>
      </div>
    </div>
  );
}
