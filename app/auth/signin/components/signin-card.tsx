"use client";

import { useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { GoogleSignInButton } from "./google-signin-button";
import { GitHubSignInButton } from "./github-signin-button";
import { RememberMeCheckbox } from "./remember-me-checkbox";
import { ContinueWithoutSignIn } from "./continue-without-signin";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { setRememberMeCookie } from "@/lib/auth-utils";
import { Separator } from "@/components/ui/separator";

export const SignInCard = () => {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
  const [rememberMe, setRememberMe] = useState(false);

  const handleGoogleSignIn = useCallback(() => {
    setRememberMeCookie(rememberMe);
  }, [rememberMe]);

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">로그인</CardTitle>
        <CardDescription>
          QR 코드 히스토리 및 고급 기능을 이용하려면 로그인하세요
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <GoogleSignInButton
            callbackUrl={callbackUrl}
            onSignIn={handleGoogleSignIn}
          />
          <GitHubSignInButton
            callbackUrl={callbackUrl}
            onSignIn={handleGoogleSignIn}
          />
        </div>
        <RememberMeCheckbox
          checked={rememberMe}
          onCheckedChange={setRememberMe}
        />
      </CardContent>
      <CardFooter className="flex flex-col space-y-4">
        <Separator />
        <ContinueWithoutSignIn />
      </CardFooter>
    </Card>
  );
};
