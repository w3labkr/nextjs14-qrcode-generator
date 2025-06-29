-- 오래된 로그 정리 스크립트

-- 90일 이전의 DEBUG, INFO 레벨 로그 삭제
DELETE FROM application_logs
WHERE created_at < NOW() - INTERVAL '90 days'
  AND level IN ('DEBUG', 'INFO');

-- 30일 이전의 ACCESS 로그 중 성공한 요청 삭제 (200번대 응답)
DELETE FROM application_logs
WHERE created_at < NOW() - INTERVAL '30 days'
  AND type = 'ACCESS'
  AND level = 'INFO'
  AND (metadata->>'statusCode')::int BETWEEN 200 AND 299;

-- 로그 정리 통계 조회
SELECT
  type,
  level,
  COUNT(*) as remaining_count,
  MIN(created_at) as oldest_log,
  MAX(created_at) as newest_log
FROM application_logs
GROUP BY type, level
ORDER BY type, level;
