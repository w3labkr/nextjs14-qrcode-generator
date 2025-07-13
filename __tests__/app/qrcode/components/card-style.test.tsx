import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { CardStyle } from "@/app/qrcode/components/card-style";

// Mock next/image
jest.mock("next/image", () => ({
  __esModule: true,
  default: (props: any) => <img {...props} />,
}));

// QR 코드 폼 스키마 정의
const qrcodeFormSchema = z.object({
  styleForegroundColor: z.string(),
  styleBackgroundColor: z.string(),
  styleLogo: z.string(),
  styleBorderStyle: z.enum(["none", "solid", "dashed", "dotted"]),
  styleText: z.string(),
  styleBorderColor: z.string(),
  styleTextColor: z.string(),
  styleBorderRadius: z.number().min(0).max(50),
  styleBorderWidth: z.number().min(0).max(20),
  styleFontSize: z.number().min(8).max(48),
});

type QrcodeFormValues = z.infer<typeof qrcodeFormSchema>;

const defaultValues: QrcodeFormValues = {
  styleForegroundColor: "#000000",
  styleBackgroundColor: "#ffffff",
  styleLogo: "",
  styleBorderStyle: "none",
  styleText: "",
  styleBorderColor: "#000000",
  styleTextColor: "#000000",
  styleBorderRadius: 16,
  styleBorderWidth: 2,
  styleFontSize: 16,
};

// 테스트용 래퍼 컴포넌트
function TestWrapper({
  children,
  initialValues = defaultValues,
}: {
  children: React.ReactNode;
  initialValues?: Partial<QrcodeFormValues>;
}) {
  const methods = useForm<QrcodeFormValues>({
    resolver: zodResolver(qrcodeFormSchema),
    defaultValues: { ...defaultValues, ...initialValues },
  });

  return <FormProvider {...methods}>{children}</FormProvider>;
}

describe("CardStyle", () => {
  describe("렌더링", () => {
    it("카드 제목과 설명이 렌더링되어야 한다", () => {
      render(
        <TestWrapper>
          <CardStyle />
        </TestWrapper>,
      );

      expect(screen.getByText("디자인")).toBeInTheDocument();
      expect(
        screen.getByText(
          "QR 코드의 디자인을 설정합니다. 프레임 스타일, 안내 문구, 색상 등을 조정할 수 있습니다.",
        ),
      ).toBeInTheDocument();
    });

    it("모든 스타일 설정 필드가 렌더링되어야 한다", () => {
      render(
        <TestWrapper>
          <CardStyle />
        </TestWrapper>,
      );

      // 색상 필드들
      expect(screen.getByText("전경색")).toBeInTheDocument();
      expect(screen.getByText("배경색")).toBeInTheDocument();

      // 로고 업로드
      expect(screen.getByText("로고")).toBeInTheDocument();

      // 테두리 스타일
      expect(screen.getByText("테두리 스타일")).toBeInTheDocument();

      // 초기화 버튼
      expect(
        screen.getByRole("button", { name: "디자인 초기화" }),
      ).toBeInTheDocument();
    });
  });

  describe("기본값", () => {
    it("기본 색상 값들이 설정되어야 한다", () => {
      render(
        <TestWrapper>
          <CardStyle />
        </TestWrapper>,
      );

      const foregroundColor = screen.getByDisplayValue("#000000");
      const backgroundColor = screen.getByDisplayValue("#ffffff");

      expect(foregroundColor).toBeInTheDocument();
      expect(backgroundColor).toBeInTheDocument();
    });

    it('기본 테두리 스타일이 "없음"으로 설정되어야 한다', () => {
      render(
        <TestWrapper>
          <CardStyle />
        </TestWrapper>,
      );

      expect(screen.getByText("없음")).toBeInTheDocument();
    });
  });

  describe("사용자 상호작용", () => {
    it("색상 입력 필드 값을 변경할 수 있어야 한다", async () => {
      render(
        <TestWrapper>
          <CardStyle />
        </TestWrapper>,
      );

      const foregroundColorInput = screen.getByDisplayValue("#000000");

      fireEvent.change(foregroundColorInput, { target: { value: "#ff0000" } });

      await waitFor(() => {
        expect(foregroundColorInput).toHaveValue("#ff0000");
      });
    });

    it("테두리 스타일을 변경할 수 있어야 한다", async () => {
      render(
        <TestWrapper>
          <CardStyle />
        </TestWrapper>,
      );

      const borderStyleSelect = screen.getByRole("combobox");

      fireEvent.click(borderStyleSelect);

      await waitFor(() => {
        expect(screen.getByText("심플")).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText("심플"));

      await waitFor(() => {
        expect(screen.getByText("심플")).toBeInTheDocument();
      });
    });
  });

  describe("초기화 기능", () => {
    it("스타일 초기화 버튼을 클릭하면 모든 값이 기본값으로 재설정되어야 한다", async () => {
      const customValues = {
        styleForegroundColor: "#ff0000",
        styleBackgroundColor: "#000000",
      };

      render(
        <TestWrapper initialValues={customValues}>
          <CardStyle />
        </TestWrapper>,
      );

      // 사용자 정의 값들이 설정되었는지 확인
      expect(screen.getByDisplayValue("#ff0000")).toBeInTheDocument();

      // 초기화 버튼 클릭
      const resetButton = screen.getByRole("button", { name: "디자인 초기화" });
      fireEvent.click(resetButton);

      // 기본값으로 재설정되었는지 확인
      await waitFor(() => {
        expect(screen.getByDisplayValue("#000000")).toBeInTheDocument();
        expect(screen.getByDisplayValue("#ffffff")).toBeInTheDocument();
      });
    });
  });

  describe("접근성", () => {
    it("모든 폼 필드에 적절한 라벨이 있어야 한다", () => {
      render(
        <TestWrapper>
          <CardStyle />
        </TestWrapper>,
      );

      expect(screen.getByLabelText("전경색 (선택)")).toBeInTheDocument();
      expect(screen.getByLabelText("배경색 (선택)")).toBeInTheDocument();
      expect(screen.getByLabelText("로고 (선택)")).toBeInTheDocument();
    });

    it("색상 입력 필드가 color 타입이어야 한다", () => {
      render(
        <TestWrapper>
          <CardStyle />
        </TestWrapper>,
      );

      const colorInputs = screen.getAllByDisplayValue("#000000");
      colorInputs.forEach((input) => {
        expect(input).toHaveAttribute("type", "color");
      });
    });
  });

  describe("파일 업로드", () => {
    it("로고 이미지 업로드 필드가 file 타입이어야 한다", () => {
      render(
        <TestWrapper>
          <CardStyle />
        </TestWrapper>,
      );

      const fileInput = screen.getByLabelText("로고 (선택)");
      expect(fileInput).toHaveAttribute("type", "file");
      expect(fileInput).toHaveAttribute("accept", "image/*");
    });

    it("파일을 선택할 수 있어야 한다", async () => {
      render(
        <TestWrapper>
          <CardStyle />
        </TestWrapper>,
      );

      const fileInput = screen.getByLabelText(
        "로고 (선택)",
      ) as HTMLInputElement;
      const file = new File(["logo"], "logo.png", { type: "image/png" });

      fireEvent.change(fileInput, { target: { files: [file] } });

      await waitFor(() => {
        expect(fileInput.files?.[0]).toBe(file);
        expect(fileInput.files?.[0]?.name).toBe("logo.png");
      });
    });
  });

  describe("테두리 스타일별 조건부 렌더링", () => {
    it("테두리 스타일이 기본값일 때 기본 필드들이 표시되어야 한다", () => {
      render(
        <TestWrapper>
          <CardStyle />
        </TestWrapper>,
      );

      // 기본 필드들이 항상 보여야 함
      expect(screen.getByText("전경색")).toBeInTheDocument();
      expect(screen.getByText("배경색")).toBeInTheDocument();
      expect(screen.getByText("로고")).toBeInTheDocument();
      expect(screen.getByText("테두리 스타일")).toBeInTheDocument();
    });
  });
});
