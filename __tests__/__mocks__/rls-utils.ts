// Mock 버전의 validateUserId는 항상 성공
export const validateUserId = jest.fn((userId: string) => {
  // Test에서는 유효성 검사를 무시하고 항상 통과
  return;
});

// Mock 버전의 RLS 함수들은 콜백만 실행
export const withRLS = jest.fn(async (callback: any) => {
  if (typeof callback === "function") {
    return await callback();
  }
  return callback;
});

export const withRLSTransaction = jest.fn(async (callback: any) => {
  if (typeof callback === "function") {
    return await callback();
  }
  return callback;
});

export const withAuthenticatedRLS = jest.fn(async (callback: any) => {
  if (typeof callback === "function") {
    return await callback();
  }
  return callback;
});

export const withSystemRLS = jest.fn(async (callback: any) => {
  if (typeof callback === "function") {
    return await callback();
  }
  return callback;
});

export const withAdminRLS = jest.fn(async (callback: any) => {
  if (typeof callback === "function") {
    return await callback();
  }
  return callback;
});

export const resetRLS = jest.fn();

export const setupRLS = jest.fn();

export const cleanupRLS = jest.fn();
