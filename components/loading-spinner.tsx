export function LoadingSpinner() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div 
        className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"
        role="status"
        aria-label="로딩 중..."
      >
        <span className="sr-only">로딩 중...</span>
      </div>
    </div>
  );
}
