import { AlertTriangle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface AccessDeniedAlertProps {
  title?: string;
  description?: string;
}

export function AccessDeniedAlert({
  title = "접근 권한 없음",
  description = "관리자만 이 페이지에 접근할 수 있습니다. 계정 권한을 확인해주세요.",
}: AccessDeniedAlertProps) {
  return (
    <Alert variant="destructive">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>{description}</AlertDescription>
    </Alert>
  );
}
