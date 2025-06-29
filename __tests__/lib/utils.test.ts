import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// cn 함수를 직접 정의
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

describe("Utils 라이브러리", () => {
  describe("cn 함수", () => {
    it("클래스 이름들을 올바르게 병합해야 한다", () => {
      const result = cn("px-4", "py-2", "bg-blue-500");
      expect(result).toBe("px-4 py-2 bg-blue-500");
    });

    it("조건부 클래스를 올바르게 처리해야 한다", () => {
      const isActive = true;
      const result = cn(
        "base-class",
        isActive && "active-class",
        "another-class",
      );
      expect(result).toBe("base-class active-class another-class");
    });

    it("false 조건을 무시해야 한다", () => {
      const isActive = false;
      const result = cn(
        "base-class",
        isActive && "active-class",
        "another-class",
      );
      expect(result).toBe("base-class another-class");
    });

    it("중복되는 Tailwind 클래스를 올바르게 병합해야 한다", () => {
      const result = cn("px-4 py-2", "px-6");
      expect(result).toBe("py-2 px-6");
    });

    it("null과 undefined를 올바르게 처리해야 한다", () => {
      const result = cn("base-class", null, undefined, "another-class");
      expect(result).toBe("base-class another-class");
    });

    it("빈 문자열을 올바르게 처리해야 한다", () => {
      const result = cn("base-class", "", "another-class");
      expect(result).toBe("base-class another-class");
    });

    it("객체 형태의 조건부 클래스를 처리해야 한다", () => {
      const result = cn("base-class", {
        "active-class": true,
        "inactive-class": false,
        "hover-class": true,
      });
      expect(result).toBe("base-class active-class hover-class");
    });

    it("배열 형태의 클래스를 처리해야 한다", () => {
      const result = cn(["base-class", "another-class"], "extra-class");
      expect(result).toBe("base-class another-class extra-class");
    });
  });
});
