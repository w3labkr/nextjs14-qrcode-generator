"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { User } from "next-auth";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserIcon, Loader2 } from "lucide-react";
import { updateProfile } from "@/app/actions/account-management";

const profileSchema = z.object({
  name: z
    .string()
    .min(1, "이름을 입력해주세요")
    .max(50, "이름은 50자 이하여야 합니다"),
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface ProfileFormProps {
  user: User;
}

export function ProfileForm({ user }: ProfileFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { update } = useSession();

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user.name || "",
    },
    mode: "onChange", // 실시간 검증
  });

  // 사용자 정보가 변경될 때마다 폼을 업데이트
  useEffect(() => {
    form.reset({
      name: user.name || "",
    });
  }, [user, form]);

  const onSubmit = async (data: ProfileFormData) => {
    try {
      setIsLoading(true);
      console.log("프로필 업데이트 요청:", data);

      const result = await updateProfile({
        name: data.name,
        email: user.email || "", // 기존 이메일 유지
      });
      console.log("프로필 업데이트 결과:", result);

      if (result.success) {
        toast.success("프로필이 성공적으로 업데이트되었습니다");

        // 세션 업데이트를 통해 JWT 토큰 갱신
        await update({
          name: data.name,
          email: user.email, // 기존 이메일 유지
        });

        // 폼을 새로운 값으로 리셋하여 isDirty 상태를 초기화
        form.reset(data);

        // 세션 업데이트 후 충분한 시간을 두고 페이지 새로고침
        setTimeout(() => {
          router.refresh();
        }, 100);
      } else {
        toast.error(result.error || "프로필 업데이트에 실패했습니다");
      }
    } catch (error) {
      console.error("프로필 업데이트 에러:", error);
      toast.error("프로필 업데이트 중 오류가 발생했습니다");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <UserIcon className="h-5 w-5" />
          <CardTitle>프로필 수정</CardTitle>
        </div>
        <CardDescription>계정 정보를 수정할 수 있습니다.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-4 mb-6">
          <Avatar className="h-20 w-20">
            <AvatarImage src={user.image || ""} alt={user.name || "사용자"} />
            <AvatarFallback>
              <UserIcon className="h-10 w-10" />
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="text-lg font-medium">{user.name || "사용자"}</h3>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
        </div>

        <Separator className="mb-6" />

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>이름</FormLabel>
                  <FormControl>
                    <Input placeholder="이름을 입력하세요" {...field} />
                  </FormControl>
                  <FormDescription>프로필에 표시될 이름입니다.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Separator />

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/dashboard/settings")}
                disabled={isLoading}
              >
                취소
              </Button>
              <Button
                type="submit"
                disabled={
                  isLoading ||
                  !form.formState.isDirty ||
                  !form.formState.isValid
                }
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isLoading ? "업데이트 중..." : "업데이트"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
