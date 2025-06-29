"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Link, Unlink, Github } from "lucide-react";
import { Session } from "next-auth";
import { signIn } from "next-auth/react";
import { toast } from "sonner";
import {
  getConnectedAccounts,
  disconnectOAuthProvider,
  getCurrentAccountProvider,
} from "@/app/actions/account-management";

interface OAuthConnectionsProps {
  session: Session | null;
}

interface ConnectionItem {
  provider: string;
  name: string;
  icon: React.ReactNode;
  connected: boolean;
  account?: {
    id: string;
    email?: string;
    name?: string;
  };
}

export function OAuthConnections({ session }: OAuthConnectionsProps) {
  const [isConnecting, setIsConnecting] = useState<string | null>(null);
  const [isDisconnecting, setIsDisconnecting] = useState<string | null>(null);
  const [connectedAccounts, setConnectedAccounts] = useState<any[]>([]);
  const [currentProvider, setCurrentProvider] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();

  useEffect(() => {
    loadConnectedAccounts();

    // OAuth 콜백 후 성공 메시지 표시
    const error = searchParams.get("error");
    const callbackUrl = searchParams.get("callbackUrl");

    if (error) {
      toast.error("소셜 계정 연동에 실패했습니다.");
    } else if (
      callbackUrl &&
      window.location.pathname === "/dashboard/account"
    ) {
      // 성공적으로 돌아온 경우 (URL에 특별한 파라미터가 없어도)
      const isOAuthCallback =
        document.referrer.includes("github.com") ||
        document.referrer.includes("accounts.google.com");
      if (isOAuthCallback) {
        setTimeout(() => {
          toast.success("소셜 계정이 성공적으로 연동되었습니다.");
        }, 500);
      }
    }
  }, [searchParams]);

  // 세션이 변경될 때마다 현재 프로바이더 업데이트
  useEffect(() => {
    if (session?.currentProvider) {
      setCurrentProvider(session.currentProvider);
    }
  }, [session?.currentProvider]);

  const loadConnectedAccounts = async () => {
    try {
      const [accountsResult, providerResult] = await Promise.all([
        getConnectedAccounts(),
        getCurrentAccountProvider(),
      ]);

      if (accountsResult.success) {
        setConnectedAccounts(accountsResult.accounts);
      }

      // 세션에서 currentProvider 정보가 있다면 우선 사용
      if (session?.currentProvider) {
        setCurrentProvider(session.currentProvider);
      } else if (providerResult.success) {
        setCurrentProvider(providerResult.currentProvider);
      }
    } catch (error) {
      console.error("연동된 계정 조회 실패:", error);
    } finally {
      setLoading(false);
    }
  };

  // 현재 연결된 계정 정보
  const connections: ConnectionItem[] = [
    {
      provider: "google",
      name: "Google",
      icon: (
        <svg className="h-4 w-4" viewBox="0 0 24 24">
          <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            fill="#4285F4"
          />
          <path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            fill="#34A853"
          />
          <path
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            fill="#FBBC05"
          />
          <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            fill="#EA4335"
          />
        </svg>
      ),
      connected: connectedAccounts.some((acc) => acc.provider === "google"),
      account: connectedAccounts.find((acc) => acc.provider === "google"),
    },
    {
      provider: "github",
      name: "GitHub",
      icon: <Github className="h-4 w-4" />,
      connected: connectedAccounts.some((acc) => acc.provider === "github"),
      account: connectedAccounts.find((acc) => acc.provider === "github"),
    },
  ];

  const handleConnect = async (provider: string) => {
    setIsConnecting(provider);

    // 환경 변수 확인 (개발 환경에서만)
    if (process.env.NODE_ENV === "development") {
      console.log("OAuth 연동 시도:", {
        provider,
        timestamp: new Date().toISOString(),
      });
    }

    try {
      // GitHub/Google OAuth는 실제 페이지 리다이렉트가 필요함
      await signIn(provider, {
        callbackUrl: "/dashboard/account",
      });

      // 성공 시에는 리다이렉트가 발생하므로 타이머로 상태 리셋
      setTimeout(() => {
        setIsConnecting(null);
      }, 10000);
    } catch (error) {
      console.error("OAuth 연동 오류:", error);
      toast.error(
        `${provider === "google" ? "Google" : "GitHub"} 연동 중 오류가 발생했습니다.`,
      );
      setIsConnecting(null);
    }
  };

  const handleDisconnect = async (provider: string) => {
    setIsDisconnecting(provider);
    try {
      const result = await disconnectOAuthProvider(provider);

      if (result.success) {
        toast.success(
          "message" in result ? result.message : "연동이 해제되었습니다.",
        );
        await loadConnectedAccounts();
      } else {
        toast.error(
          "error" in result ? result.error : "연동 해제에 실패했습니다.",
        );
      }
    } catch (error) {
      toast.error("연동 해제 중 오류가 발생했습니다.");
    } finally {
      setIsDisconnecting(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Link className="h-5 w-5" />
          <CardTitle>소셜 계정 연동</CardTitle>
        </div>
        <CardDescription>
          외부 소셜 계정을 연동하여 더 편리하게 로그인하세요.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <>
            {connections.map((connection) => (
              <div
                key={connection.provider}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  {connection.icon}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{connection.name}</span>
                      <Badge
                        variant={connection.connected ? "default" : "secondary"}
                      >
                        {connection.connected ? "연결됨" : "연결 안됨"}
                      </Badge>
                      {currentProvider === connection.provider && (
                        <Badge
                          variant="outline"
                          className="bg-green-50 text-green-700 border-green-200"
                        >
                          현재 로그인
                        </Badge>
                      )}
                    </div>
                    {connection.connected && connection.account && (
                      <p className="text-sm text-muted-foreground">
                        {connection.account.email ||
                          session?.user?.email ||
                          "연동된 계정"}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {connection.connected ? (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={
                            isDisconnecting === connection.provider ||
                            connectedAccounts.length <= 1 ||
                            currentProvider === connection.provider
                          }
                        >
                          <Unlink className="h-4 w-4 mr-2" />
                          {isDisconnecting === connection.provider
                            ? "해제 중..."
                            : currentProvider === connection.provider
                              ? "현재 로그인 중"
                              : connectedAccounts.length <= 1
                                ? "마지막 계정"
                                : "연동 해제"}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            {connection.name} 연동 해제
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            {connection.name} 계정 연동을 해제하시겠습니까? 해제
                            후에는 해당 계정으로 로그인할 수 없습니다.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>취소</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() =>
                              handleDisconnect(connection.provider)
                            }
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            연동 해제
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => handleConnect(connection.provider)}
                      disabled={isConnecting === connection.provider}
                    >
                      <Link className="h-4 w-4 mr-2" />
                      {isConnecting === connection.provider
                        ? "연동 중..."
                        : "연동하기"}
                    </Button>
                  )}
                </div>
              </div>
            ))}

            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <h4 className="font-medium text-amber-900 mb-2">주의사항</h4>
              <ul className="text-sm text-amber-700 space-y-1">
                <li>• 현재 로그인 중인 계정은 연동 해제할 수 없습니다.</li>
                <li>• 마지막 연동된 계정은 해제할 수 없습니다.</li>
                <li>
                  • 연동 해제 후에도 해당 계정으로 다시 로그인할 수 있습니다.
                </li>
                <li>• 연동 해제는 현재 저장된 연동 정보만 삭제합니다.</li>
                <li>• 새로운 계정 연동 시 기존 데이터는 유지됩니다.</li>
              </ul>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
