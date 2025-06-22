export default function UsageGuide() {
  return (
    <div className="border-t pt-4">
      <div className="space-y-2">
        <h4 className="font-medium">사용 방법</h4>
        <div className="text-sm text-muted-foreground space-y-1">
          <p>• 내보내기: 현재 계정의 모든 데이터를 JSON 파일로 저장</p>
          <p>• 가져오기: 다른 계정에서 내보낸 데이터를 현재 계정에 추가</p>
          <p>• 백업: 정기적으로 데이터를 내보내서 백업으로 보관</p>
          <p>• 마이그레이션: 계정 간 데이터 이동 시 활용</p>
        </div>
      </div>
    </div>
  );
}
