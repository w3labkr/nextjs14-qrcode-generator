import { useEffect } from "react";
import { toast } from "sonner";

export function useInitialEffects() {
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("deleted") === "true") {
      toast.success(
        "계정이 성공적으로 삭제되었습니다. 모든 데이터가 완전히 제거되었습니다.",
      );
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);
}

export function getDownloadFilename(format: string) {
  return `qrcode.${format}`;
}

export function getHighResDownloadFilename(format: string) {
  const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, "-");
  return `qrcode-4k-${timestamp}.${format === "pdf" ? "png" : format}`;
}
