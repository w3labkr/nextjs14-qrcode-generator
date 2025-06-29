// 통합 로그 시스템 타입 정의

export type LogType =
  | "ACCESS" // API 접근 로그
  | "AUTH" // 인증 로그
  | "AUDIT" // 감사 로그 (데이터 변경)
  | "ERROR" // 에러 로그
  | "ADMIN" // 관리자 액션 로그
  | "QR_GENERATION" // QR 코드 생성 로그
  | "SYSTEM"; // 시스템 로그

export type LogLevel = "DEBUG" | "INFO" | "WARN" | "ERROR" | "FATAL";

export type AuthAction = "LOGIN" | "LOGOUT" | "REFRESH" | "REVOKE" | "FAIL";

// 통합 로그 데이터 인터페이스
export interface ApplicationLogData {
  id?: string;
  userId?: string | null;
  type: LogType;
  action: string;
  category?: string | null;
  message?: string | null;
  metadata?: Record<string, any> | null;
  level?: LogLevel;
  ipAddress?: string | null;
  userAgent?: string | null;
  createdAt?: Date;
}

// 특정 로그 타입별 메타데이터 인터페이스
export interface AccessLogMetadata {
  method: string;
  path: string;
  statusCode: number;
  responseTime?: number;
  requestId?: string;
}

export interface AuthLogMetadata {
  authAction: AuthAction;
  provider?: string;
  sessionId?: string;
}

export interface AuditLogMetadata {
  tableName: string;
  recordId?: string;
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
  changes?: string[];
}

export interface ErrorLogMetadata {
  errorCode?: string;
  stackTrace?: string;
  requestId?: string;
  additionalInfo?: Record<string, any>;
}

export interface AdminActionLogMetadata {
  targetUserId?: string;
  affectedRecords?: number;
  details?: string;
}

export interface QrGenerationLogMetadata {
  qrType: string;
  contentHash?: string; // 개인정보 보호를 위한 해시값
  size?: string;
  format?: string;
  customization?: Record<string, any>;
}

// 로그 필터링 옵션
export interface LogFilterOptions {
  userId?: string;
  type?: LogType | LogType[];
  level?: LogLevel | LogLevel[];
  action?: string;
  category?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
  page?: number;
  orderBy?: "asc" | "desc";
  ipAddress?: string;
  search?: string; // 메시지나 액션에서 검색
}
