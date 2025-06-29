export type AuthAction = "LOGIN" | "LOGOUT" | "REFRESH" | "REVOKE" | "FAIL";

export interface AccessLogData {
  id?: string;
  userId?: string | null;
  method: string;
  path: string;
  statusCode: number;
  userAgent?: string | null;
  ipAddress?: string | null;
  createdAt?: Date;
}

export interface AuthLogData {
  id?: string;
  userId?: string | null;
  action: AuthAction;
  createdAt?: Date;
}

export interface AuditLogData {
  id?: string;
  userId?: string | null;
  action: string;
  tableName: string;
  recordId?: string | null;
  createdAt?: Date;
}

export interface ErrorLogData {
  id?: string;
  userId?: string | null;
  errorMessage: string;
  createdAt?: Date;
}

export interface AdminActionLogData {
  id?: string;
  adminId: string;
  action: string;
  detail?: string | null;
  createdAt?: Date;
}

export interface QrGenerationLogData {
  id?: string;
  userId?: string | null;
  qrType: string;
  content: string;
  ipAddress?: string | null;
  userAgent?: string | null;
  createdAt?: Date;
}

// 로그 필터링 옵션
export interface LogFilterOptions {
  userId?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
  orderBy?: "asc" | "desc";
}

// API 요청 로그 옵션
export interface AccessLogFilterOptions extends LogFilterOptions {
  method?: string;
  statusCode?: number;
  path?: string;
}

// 인증 로그 필터링 옵션
export interface AuthLogFilterOptions extends LogFilterOptions {
  action?: AuthAction;
}

// 감사 로그 필터링 옵션
export interface AuditLogFilterOptions extends LogFilterOptions {
  tableName?: string;
  action?: string;
}

// 관리자 액션 로그 필터링 옵션
export interface AdminActionLogFilterOptions extends LogFilterOptions {
  action?: string;
}

// QR 코드 생성 로그 필터링 옵션
export interface QrGenerationLogFilterOptions extends LogFilterOptions {
  qrType?: string;
}
