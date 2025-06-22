import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Mail } from "lucide-react";

export default function VerifyRequestPage() {
  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <Card className="mx-auto max-w-sm">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
            <Mail className="h-6 w-6 text-blue-600" />
          </div>
          <CardTitle className="text-2xl">이메일을 확인해 주세요</CardTitle>
          <CardDescription>
            입력하신 이메일 주소로 로그인 링크를 전송했습니다.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center text-sm text-gray-600">
          <p className="mb-4">
            이메일함을 확인하시고 로그인 링크를 클릭해 주세요.
          </p>
          <p className="text-xs text-gray-500">
            이메일이 도착하지 않으셨나요? 스팸함도 확인해 보세요.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
