import { appConfig } from "@/config/app";

export const setRememberMeCookie = (remember: boolean) => {
  const value = remember ? "true" : "false";
  const maxAge = appConfig.session.sessionMaxAgeRemember;
  const cookieString = `remember-me=${value}; path=/; max-age=${maxAge}; secure; samesite=strict`;
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
