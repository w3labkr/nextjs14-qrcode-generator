import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { ProfileForm } from "./components/profile-form";

// 페이지를 강제로 동적으로 만들어 캐시 방지
export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/signin");
  }

  return (
    <div className="space-y-6">
      <ProfileForm user={session.user} />
    </div>
  );
}
