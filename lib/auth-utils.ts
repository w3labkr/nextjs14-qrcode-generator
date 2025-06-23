const REMEMBER_ME_DURATION = 30 * 24 * 60 * 60; // 30일 (초)

export const setRememberMeCookie = (remember: boolean) => {
  const value = remember ? "true" : "false";
  const cookieString = `remember-me=${value}; path=/; max-age=${REMEMBER_ME_DURATION}; secure; samesite=strict`;
  document.cookie = cookieString;
};

export const getRememberMeCookie = (): boolean => {
  if (typeof document === "undefined") return false;

  const cookies = document.cookie.split(";");
  const rememberMeCookie = cookies.find((cookie) =>
    cookie.trim().startsWith("remember-me="),
  );

  if (rememberMeCookie) {
    const value = rememberMeCookie.split("=")[1];
    return value === "true";
  }

  return false;
};
