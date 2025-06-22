export default function OfflinePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="text-center space-y-6">
        <div className="text-6xl">📱</div>
        <h1 className="text-4xl font-bold">오프라인 상태</h1>
        <p className="text-xl text-muted-foreground max-w-md">
          인터넷 연결을 확인하고 다시 시도해주세요.
          <br />
          기본적인 QR 코드 생성은 계속 사용 가능합니다.
        </p>
        <div className="space-y-2">
          <button
            onClick={() => window.location.reload()}
            className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
          >
            다시 시도
          </button>
        </div>
      </div>
    </div>
  );
}
