"use client";

import { Session } from "next-auth";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { User } from "lucide-react";
import Link from "next/link";

interface UserProfileProps {
  session: Session;
}

export function UserProfile({ session }: UserProfileProps) {
  return (
    <DropdownMenuItem asChild>
      <Link
        href="/dashboard/account"
        className="flex items-center justify-start gap-2 p-2"
      >
        <div className="flex flex-col space-y-1 leading-none">
          {session.user?.name && (
            <p className="font-medium">{session.user.name}</p>
          )}
          {session.user?.email && (
            <p className="w-[200px] truncate text-sm text-muted-foreground">
              {session.user.email}
            </p>
          )}
        </div>
      </Link>
    </DropdownMenuItem>
  );
}
