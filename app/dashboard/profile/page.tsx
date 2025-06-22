import { UserNav } from "@/components/user-nav";

export default function ProfilePage() {
  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">프로필</h1>
          <p className="text-muted-foreground">
            사용자 프로필 정보를 확인하고 관리하세요.
          </p>
        </div>
        <UserNav />
      </div>

      <div className="mt-6">
        <div className="bg-card text-card-foreground rounded-lg border p-6">
          <h2 className="text-lg font-semibold mb-4">프로필 정보</h2>
          <p className="text-muted-foreground">
            프로필 관리 기능이 곧 추가될 예정입니다.
          </p>
        </div>
      </div>
    </div>
  );
}
