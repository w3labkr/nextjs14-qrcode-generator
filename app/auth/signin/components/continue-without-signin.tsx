import { Button } from "@/components/ui/button";

export const ContinueWithoutSignIn = () => {
  return (
    <div className="text-center">
      <Button variant="link" asChild>
        <a href="/">로그인 없이 계속하기</a>
      </Button>
    </div>
  );
};
