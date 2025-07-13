"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  User,
  History,
  Settings,
  LogOut,
  Database,
  UserCog,
  Shield,
} from "lucide-react";
import Link from "next/link";
import { UserProfile } from "@/components/user-profile";
import { logAuthAction } from "@/app/actions";
import { useEffect, useState } from "react";

export function UserNav() {
  const { data: session, status } = useSession();
  const [isAdmin, setIsAdmin] = useState(false);

  // 관리자 권한 확인
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (session?.user?.email) {
        try {
          const response = await axios.get("/api/admin/check");
          setIsAdmin(response.data.isAdmin);
        } catch (error) {
          console.error("관리자 권한 확인 실패:", error);
          setIsAdmin(false);
        }
      }
    };

    checkAdminStatus();
  }, [session]);

  if (status === "loading") {
    return <div className="h-8 w-8 animate-pulse bg-gray-200 rounded-full" />;
  }

  if (status === "unauthenticated" || !session) {
    return (
      <div className="flex gap-2">
        <Button asChild variant="outline">
          <Link href="/auth/signin">로그인</Link>
        </Button>
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src={session.user?.image || ""} />
            <AvatarFallback>
              {session.user?.name?.charAt(0) || "U"}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <UserProfile session={session} />
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/dashboard">
            <User className="mr-2 h-4 w-4" />
            대시보드
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/dashboard/history">
            <History className="mr-2 h-4 w-4" />
            히스토리
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/dashboard/settings">
            <Settings className="mr-2 h-4 w-4" />
            설정
          </Link>
        </DropdownMenuItem>
        {isAdmin && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/dashboard/admin/logs">
                <Shield className="mr-2 h-4 w-4" />
                관리자 로그
              </Link>
            </DropdownMenuItem>
          </>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="cursor-pointer"
          onSelect={async (event) => {
            event.preventDefault();

            // 로그아웃 로그 기록
            try {
              if (session?.user?.id) {
                await logAuthAction({
                  action: "로그아웃",
                  authAction: "LOGOUT",
                });
              }
            } catch (error) {
              console.error("로그아웃 로그 기록 실패:", error);
            }

            signOut({ callbackUrl: "/" });
          }}
        >
          <LogOut className="mr-2 h-4 w-4" />
          로그아웃
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
