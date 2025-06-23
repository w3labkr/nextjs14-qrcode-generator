import { Suspense } from "react";
import {
  SignInCard,
  SignInLoadingFallback,
} from "@/app/auth/signin/components";

export default function SignIn() {
  return (
    <Suspense fallback={<SignInLoadingFallback />}>
      <SignInCard />
    </Suspense>
  );
}
