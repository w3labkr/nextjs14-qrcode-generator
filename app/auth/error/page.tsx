import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function AuthError() {
  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl text-red-600">로그인 오류</CardTitle>
        <CardDescription>
          로그인 중 오류가 발생했습니다. 다시 시도해주세요.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button className="w-full" asChild>
          <a href="/auth/signin">다시 로그인</a>
        </Button>
        <div className="text-center">
          <Button variant="link" asChild>
            <a href="/">홈으로 돌아가기</a>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
