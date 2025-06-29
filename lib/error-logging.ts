import { UnifiedLogger } from "@/lib/unified-logging";

/**
 * 함수 실행 중 발생하는 에러를 자동으로 로그에 기록하는 데코레이터
 */
export function withErrorLogging<T extends any[], R>(
  func: (...args: T) => Promise<R>,
  context?: string,
) {
  return async (...args: T): Promise<R> => {
    try {
      return await func(...args);
    } catch (error) {
      // 에러 로그 기록
      const errorMessage = `${context ? `[${context}] ` : ""}${error instanceof Error ? error.message : String(error)}`;

      try {
        await UnifiedLogger.logError({
          error: errorMessage,
        });
      } catch (logError) {
        console.error("에러 로그 기록 실패:", logError);
      }

      // 원본 에러 다시 throw
      throw error;
    }
  };
}

/**
 * 동기 함수용 에러 로깅 래퍼
 */
export function withErrorLoggingSync<T extends any[], R>(
  func: (...args: T) => R,
  context?: string,
) {
  return (...args: T): R => {
    try {
      return func(...args);
    } catch (error) {
      // 에러 로그 기록 (비동기로 처리)
      const errorMessage = `${context ? `[${context}] ` : ""}${error instanceof Error ? error.message : String(error)}`;

      Promise.resolve()
        .then(() =>
          UnifiedLogger.logError({
            error: errorMessage,
          }),
        )
        .catch((logError) => console.error("에러 로그 기록 실패:", logError));

      // 원본 에러 다시 throw
      throw error;
    }
  };
}

/**
 * Promise를 래핑하여 에러 발생 시 자동으로 로그에 기록
 */
export async function withPromiseErrorLogging<T>(
  promise: Promise<T>,
  context?: string,
  userId?: string,
): Promise<T> {
  try {
    return await promise;
  } catch (error) {
    // 에러 로그 기록
    const errorMessage = `${context ? `[${context}] ` : ""}${error instanceof Error ? error.message : String(error)}`;

    try {
      await UnifiedLogger.logError({
        userId,
        error: errorMessage,
      });
    } catch (logError) {
      console.error("에러 로그 기록 실패:", logError);
    }

    // 원본 에러 다시 throw
    throw error;
  }
}

/**
 * 클래스 메서드에 에러 로깅을 적용하는 데코레이터
 */
export function ErrorLogged(context?: string) {
  return function (
    target: any,
    propertyName: string,
    descriptor: PropertyDescriptor,
  ) {
    const method = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      try {
        return await method.apply(this, args);
      } catch (error) {
        // 에러 로그 기록
        const errorMessage = `${context || `${target.constructor.name}.${propertyName}`}: ${error instanceof Error ? error.message : String(error)}`;

        try {
          await UnifiedLogger.logError({
            error: errorMessage,
          });
        } catch (logError) {
          console.error("에러 로그 기록 실패:", logError);
        }

        // 원본 에러 다시 throw
        throw error;
      }
    };

    return descriptor;
  };
}

/**
 * 전역 에러 핸들러 설정 (클라이언트 사이드)
 */
export function setupGlobalErrorLogging() {
  if (typeof window !== "undefined") {
    // 처리되지 않은 Promise rejection 에러 처리
    window.addEventListener("unhandledrejection", (event) => {
      const errorMessage = `Unhandled Promise Rejection: ${event.reason instanceof Error ? event.reason.message : String(event.reason)}`;

      Promise.resolve()
        .then(() =>
          UnifiedLogger.logError({
            error: errorMessage,
          }),
        )
        .catch((logError) => console.error("에러 로그 기록 실패:", logError));
    });

    // 일반 JavaScript 에러 처리
    window.addEventListener("error", (event) => {
      const errorMessage = `JavaScript Error: ${event.error instanceof Error ? event.error.message : event.message} at ${event.filename}:${event.lineno}:${event.colno}`;

      Promise.resolve()
        .then(() =>
          UnifiedLogger.logError({
            error: errorMessage,
          }),
        )
        .catch((logError) => console.error("에러 로그 기록 실패:", logError));
    });
  }
}

/**
 * 에러 로그와 함께 사용자 친화적인 에러 메시지 반환
 */
export async function handleUserFacingError(
  error: unknown,
  userMessage: string,
  context?: string,
  userId?: string,
): Promise<never> {
  // 에러 로그 기록
  const errorMessage = `${context ? `[${context}] ` : ""}${error instanceof Error ? error.message : String(error)}`;

  try {
    await UnifiedLogger.logError({
      userId,
      error: errorMessage,
    });
  } catch (logError) {
    console.error("에러 로그 기록 실패:", logError);
  }

  // 사용자에게는 친화적인 메시지 표시
  throw new Error(userMessage);
}
