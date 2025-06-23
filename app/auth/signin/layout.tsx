import { ReactNode } from "react";

interface AuthLayoutProps {
  children: ReactNode;
}

export default function SignInLayout({ children }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      {children}
    </div>
  );
}
