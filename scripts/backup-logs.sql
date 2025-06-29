-- 기존 로그 데이터 백업 스크립트

-- 백업 테이블 생성
CREATE TABLE IF NOT EXISTS logs_backup_access AS SELECT * FROM access_logs;
CREATE TABLE IF NOT EXISTS logs_backup_auth AS SELECT * FROM auth_logs;
CREATE TABLE IF NOT EXISTS logs_backup_audit AS SELECT * FROM audit_logs;
CREATE TABLE IF NOT EXISTS logs_backup_error AS SELECT * FROM error_logs;
CREATE TABLE IF NOT EXISTS logs_backup_admin AS SELECT * FROM admin_action_logs;
CREATE TABLE IF NOT EXISTS logs_backup_qr AS SELECT * FROM qr_generation_logs;
