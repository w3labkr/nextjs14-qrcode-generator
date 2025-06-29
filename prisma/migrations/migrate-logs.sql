-- 기존 로그 데이터를 새로운 통합 로그 테이블로 마이그레이션하는 SQL 스크립트

-- 1. 새 테이블 생성 (이미 스키마에 정의됨)

-- 2. 기존 데이터를 새 테이블로 마이그레이션

-- ACCESS_LOGS 마이그레이션
INSERT INTO application_logs (
  id, user_id, type, action, category, message, metadata, level, ip_address, user_agent, created_at
)
SELECT
  id,
  user_id,
  'ACCESS'::log_type,
  CONCAT(method, ' ', path),
  'API_ACCESS',
  CONCAT(method, ' ', path, ' - ', status_code),
  JSON_BUILD_OBJECT(
    'method', method,
    'path', path,
    'statusCode', status_code
  ),
  CASE
    WHEN status_code >= 400 THEN 'ERROR'::log_level
    ELSE 'INFO'::log_level
  END,
  ip_address,
  user_agent,
  created_at
FROM access_logs;

-- AUTH_LOGS 마이그레이션
INSERT INTO application_logs (
  id, user_id, type, action, category, message, metadata, level, ip_address, user_agent, created_at
)
SELECT
  id,
  user_id,
  'AUTH'::log_type,
  action::text,
  'AUTHENTICATION',
  CONCAT('사용자 인증: ', action),
  JSON_BUILD_OBJECT(
    'authAction', action
  ),
  CASE
    WHEN action = 'FAIL' THEN 'WARN'::log_level
    ELSE 'INFO'::log_level
  END,
  NULL,
  NULL,
  created_at
FROM auth_logs;

-- AUDIT_LOGS 마이그레이션
INSERT INTO application_logs (
  id, user_id, type, action, category, message, metadata, level, ip_address, user_agent, created_at
)
SELECT
  id,
  user_id,
  'AUDIT'::log_type,
  action,
  'DATA_CHANGE',
  CONCAT(table_name, ' 테이블에서 ', action, ' 수행'),
  JSON_BUILD_OBJECT(
    'tableName', table_name,
    'recordId', record_id
  ),
  'INFO'::log_level,
  NULL,
  NULL,
  created_at
FROM audit_logs;

-- ERROR_LOGS 마이그레이션
INSERT INTO application_logs (
  id, user_id, type, action, category, message, metadata, level, ip_address, user_agent, created_at
)
SELECT
  id,
  user_id,
  'ERROR'::log_type,
  'ERROR_OCCURRED',
  'APPLICATION_ERROR',
  error_message,
  JSON_BUILD_OBJECT(),
  'ERROR'::log_level,
  NULL,
  NULL,
  created_at
FROM error_logs;

-- ADMIN_ACTION_LOGS 마이그레이션
INSERT INTO application_logs (
  id, user_id, type, action, category, message, metadata, level, ip_address, user_agent, created_at
)
SELECT
  id,
  admin_id,
  'ADMIN'::log_type,
  action,
  'ADMIN_ACTION',
  CONCAT('관리자 액션: ', action),
  JSON_BUILD_OBJECT(
    'details', detail
  ),
  'INFO'::log_level,
  NULL,
  NULL,
  created_at
FROM admin_action_logs;

-- QR_GENERATION_LOGS 마이그레이션
INSERT INTO application_logs (
  id, user_id, type, action, category, message, metadata, level, ip_address, user_agent, created_at
)
SELECT
  id,
  user_id,
  'QR_GENERATION'::log_type,
  'QR_CODE_GENERATED',
  'QR_SERVICE',
  CONCAT('QR 코드 생성: ', qr_type),
  JSON_BUILD_OBJECT(
    'qrType', qr_type,
    'contentHash', content
  ),
  'INFO'::log_level,
  ip_address,
  user_agent,
  created_at
FROM qr_generation_logs;
