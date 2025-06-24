import { Suspense } from "react";
import { SignInCard } from "@/app/auth/signin/components";
import { LoadingSpinner } from "@/components/loading-spinner";

export default function SignIn() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <SignInCard />
    </Suspense>
  );
}
