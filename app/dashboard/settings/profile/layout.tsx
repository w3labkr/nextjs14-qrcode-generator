export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">프로필 수정</h1>
        <p className="text-muted-foreground">
          계정 정보를 수정하고 관리할 수 있습니다.
        </p>
      </div>
      {children}
    </div>
  );
}
