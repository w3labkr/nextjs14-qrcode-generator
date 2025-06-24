import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface UnauthenticatedProps {
  title?: string;
  description?: string;
  buttonText?: string;
  href?: string;
}

export function Unauthenticated({
  title = "로그인이 필요합니다",
  description = "대시보드를 보려면 로그인해주세요.",
  buttonText = "로그인",
  href = "/auth/signin",
}: UnauthenticatedProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <Button asChild>
            <Link href={href}>{buttonText}</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
