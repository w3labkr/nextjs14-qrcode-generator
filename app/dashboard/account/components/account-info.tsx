"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Edit } from "lucide-react";
import { Session } from "next-auth";
import { ProfileForm } from "./profile-form";

interface AccountInfoProps {
  session: Session | null;
}

export function AccountInfo({ session }: AccountInfoProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleEditProfile = () => {
    setIsDialogOpen(true);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <User className="h-5 w-5" />
            <CardTitle>계정 정보</CardTitle>
          </div>
          <Button
            size="sm"
            onClick={handleEditProfile}
            className="flex items-center gap-2"
          >
            <Edit className="h-4 w-4" />
            프로필 수정
          </Button>
        </div>
        <CardDescription>로그인한 계정의 기본 정보입니다.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground">
              이름
            </label>
            <p className="text-lg">{session?.user?.name || "정보 없음"}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">
              이메일
            </label>
            <p className="text-lg">{session?.user?.email || "정보 없음"}</p>
          </div>
        </div>
        <div className="flex justify-between items-center">
          <p className="text-sm text-muted-foreground">
            프로필 수정 버튼을 클릭하여 계정 정보를 수정할 수 있습니다.
          </p>
        </div>
      </CardContent>

      <ProfileForm
        session={session}
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
      />
    </Card>
  );
}
