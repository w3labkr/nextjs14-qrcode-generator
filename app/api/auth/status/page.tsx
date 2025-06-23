import {
  validateAuthEnvironment,
  logAuthEnvironment,
} from "@/lib/env-validation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function AuthStatusPage() {
  const isValid = validateAuthEnvironment();

  const envVars = [
    { name: "AUTH_SECRET", value: !!process.env.AUTH_SECRET },
    { name: "AUTH_GOOGLE_ID", value: !!process.env.AUTH_GOOGLE_ID },
    { name: "AUTH_GOOGLE_SECRET", value: !!process.env.AUTH_GOOGLE_SECRET },
    { name: "NEXTAUTH_URL", value: process.env.NEXTAUTH_URL },
    { name: "NODE_ENV", value: process.env.NODE_ENV },
  ];

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            인증 시스템 상태
            <Badge variant={isValid ? "default" : "destructive"}>
              {isValid ? "정상" : "오류"}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">환경 변수 상태</h3>
              <div className="grid gap-2">
                {envVars.map(({ name, value }) => (
                  <div key={name} className="flex justify-between items-center">
                    <span className="font-mono text-sm">{name}</span>
                    <Badge variant={value ? "default" : "destructive"}>
                      {typeof value === "boolean"
                        ? value
                          ? "설정됨"
                          : "누락"
                        : value || "누락"}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">
                Google OAuth 설정 확인사항
              </h3>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>
                  • Google Cloud Console에서 OAuth 2.0 클라이언트 ID 생성 확인
                </li>
                <li>
                  • 승인된 리디렉션 URI:{" "}
                  <code>
                    {process.env.NEXTAUTH_URL}/api/auth/callback/google
                  </code>
                </li>
                <li>
                  • 승인된 JavaScript 원본:{" "}
                  <code>{process.env.NEXTAUTH_URL}</code>
                </li>
                <li>• 프로젝트에서 Google+ API 활성화 확인</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
