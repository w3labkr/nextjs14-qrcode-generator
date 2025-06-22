"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Session } from "next-auth";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { updateProfile } from "@/app/actions/account-management";

const profileSchema = z.object({
  name: z
    .string()
    .min(1, "이름을 입력해주세요")
    .max(50, "이름은 50자 이하여야 합니다"),
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface EditProfileDialogProps {
  session: Session | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditProfileDialog({
  session,
  open,
  onOpenChange,
}: EditProfileDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { update } = useSession();

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: session?.user?.name || "",
    },
    mode: "onChange",
  });

  const onSubmit = async (data: ProfileFormData) => {
    try {
      setIsLoading(true);
      console.log("프로필 업데이트 요청:", data);

      const result = await updateProfile({
        name: data.name,
        email: session?.user?.email || "", // 기존 이메일 유지
      });
      console.log("프로필 업데이트 결과:", result);

      if (result.success) {
        toast.success("프로필이 성공적으로 업데이트되었습니다");

        await update({
          name: data.name,
          email: session?.user?.email, // 기존 이메일 유지
        });

        form.reset(data);
        onOpenChange(false);

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

  const handleCancel = () => {
    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>프로필 수정</DialogTitle>
          <DialogDescription>
            계정 정보를 수정할 수 있습니다. 변경사항을 저장하려면 저장 버튼을
            클릭하세요.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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

            <div className="space-y-2">
              <label className="text-sm font-medium">이메일 (읽기 전용)</label>
              <Input
                type="email"
                value={session?.user?.email || ""}
                disabled
                className="bg-muted"
              />
              <p className="text-sm text-muted-foreground">
                OAuth 로그인으로 가입한 계정의 이메일은 수정할 수 없습니다.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
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
                {isLoading ? "저장 중..." : "저장"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
