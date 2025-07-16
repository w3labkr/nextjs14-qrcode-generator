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
  styleBorderStyle: z.enum(["none", "simple", "rounded", "custom"]),
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

    it('테두리 스타일을 "없음"으로 변경하면 관련 값들이 기본값으로 설정되어야 한다', async () => {
      const TestComponent = () => {
        const methods = useForm<QrcodeFormValues>({
          resolver: zodResolver(qrcodeFormSchema),
          defaultValues: { ...defaultValues, styleBorderStyle: "custom" },
        });

        return (
          <FormProvider {...methods}>
            <CardStyle />
            <div data-testid="border-radius">
              {methods.watch("styleBorderRadius")}
            </div>
            <div data-testid="border-width">
              {methods.watch("styleBorderWidth")}
            </div>
          </FormProvider>
        );
      };

      render(<TestComponent />);

      const borderStyleSelect = screen.getByRole("combobox");
      fireEvent.click(borderStyleSelect);

      await waitFor(() => {
        expect(screen.getByText("없음")).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText("없음"));

      await waitFor(() => {
        expect(screen.getByTestId("border-radius")).toHaveTextContent("0");
        expect(screen.getByTestId("border-width")).toHaveTextContent("1");
      });
    });

    it('테두리 스타일을 "심플"로 변경하면 관련 값들이 설정되어야 한다', async () => {
      const TestComponent = () => {
        const methods = useForm<QrcodeFormValues>({
          resolver: zodResolver(qrcodeFormSchema),
          defaultValues,
        });

        return (
          <FormProvider {...methods}>
            <CardStyle />
            <div data-testid="border-radius">
              {methods.watch("styleBorderRadius")}
            </div>
            <div data-testid="border-width">
              {methods.watch("styleBorderWidth")}
            </div>
          </FormProvider>
        );
      };

      render(<TestComponent />);

      const borderStyleSelect = screen.getByRole("combobox");
      fireEvent.click(borderStyleSelect);

      await waitFor(() => {
        expect(screen.getByText("심플")).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText("심플"));

      await waitFor(() => {
        expect(screen.getByTestId("border-radius")).toHaveTextContent("0");
        expect(screen.getByTestId("border-width")).toHaveTextContent("2");
      });
    });

    it('테두리 스타일을 "둥근 모서리"로 변경하면 관련 값들이 설정되어야 한다', async () => {
      const TestComponent = () => {
        const methods = useForm<QrcodeFormValues>({
          resolver: zodResolver(qrcodeFormSchema),
          defaultValues,
        });

        return (
          <FormProvider {...methods}>
            <CardStyle />
            <div data-testid="border-radius">
              {methods.watch("styleBorderRadius")}
            </div>
            <div data-testid="border-width">
              {methods.watch("styleBorderWidth")}
            </div>
          </FormProvider>
        );
      };

      render(<TestComponent />);

      const borderStyleSelect = screen.getByRole("combobox");
      fireEvent.click(borderStyleSelect);

      await waitFor(() => {
        expect(screen.getByText("둥근 모서리")).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText("둥근 모서리"));

      await waitFor(() => {
        expect(screen.getByTestId("border-radius")).toHaveTextContent("16");
        expect(screen.getByTestId("border-width")).toHaveTextContent("2");
      });
    });

    it('테두리 스타일을 "사용자 정의"로 변경하면 관련 값들이 설정되어야 한다', async () => {
      const TestComponent = () => {
        const methods = useForm<QrcodeFormValues>({
          resolver: zodResolver(qrcodeFormSchema),
          defaultValues,
        });

        return (
          <FormProvider {...methods}>
            <CardStyle />
            <div data-testid="style-text">{methods.watch("styleText")}</div>
            <div data-testid="border-radius">
              {methods.watch("styleBorderRadius")}
            </div>
            <div data-testid="border-width">
              {methods.watch("styleBorderWidth")}
            </div>
          </FormProvider>
        );
      };

      render(<TestComponent />);

      const borderStyleSelect = screen.getByRole("combobox");
      fireEvent.click(borderStyleSelect);

      await waitFor(() => {
        expect(
          screen.getByText("사용자 정의 (테두리 + 텍스트 자유 설정)"),
        ).toBeInTheDocument();
      });

      fireEvent.click(
        screen.getByText("사용자 정의 (테두리 + 텍스트 자유 설정)"),
      );

      await waitFor(() => {
        expect(screen.getByTestId("style-text")).toHaveTextContent(
          "스캔해주세요",
        );
        expect(screen.getByTestId("border-radius")).toHaveTextContent("16");
        expect(screen.getByTestId("border-width")).toHaveTextContent("2");
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

    it("파일 크기가 5MB를 초과하면 경고 메시지가 표시되어야 한다", async () => {
      // alert 모킹
      const alertSpy = jest.spyOn(window, "alert").mockImplementation();

      render(
        <TestWrapper>
          <CardStyle />
        </TestWrapper>,
      );

      const fileInput = screen.getByLabelText(
        "로고 (선택)",
      ) as HTMLInputElement;

      // 6MB 크기의 파일 생성
      const largeFile = new File(["x".repeat(6 * 1024 * 1024)], "large.png", {
        type: "image/png",
      });

      fireEvent.change(fileInput, { target: { files: [largeFile] } });

      await waitFor(() => {
        expect(alertSpy).toHaveBeenCalledWith(
          "파일 크기는 5MB 이하여야 합니다.",
        );
      });

      alertSpy.mockRestore();
    });

    it("이미지가 아닌 파일을 업로드하면 경고 메시지가 표시되어야 한다", async () => {
      // alert 모킹
      const alertSpy = jest.spyOn(window, "alert").mockImplementation();

      render(
        <TestWrapper>
          <CardStyle />
        </TestWrapper>,
      );

      const fileInput = screen.getByLabelText(
        "로고 (선택)",
      ) as HTMLInputElement;

      // 텍스트 파일 생성
      const textFile = new File(["text content"], "document.txt", {
        type: "text/plain",
      });

      fireEvent.change(fileInput, { target: { files: [textFile] } });

      await waitFor(() => {
        expect(alertSpy).toHaveBeenCalledWith(
          "이미지 파일만 업로드할 수 있습니다.",
        );
      });

      alertSpy.mockRestore();
    });

    it("유효한 이미지 파일을 업로드하면 base64로 변환되어야 한다", async () => {
      const TestComponent = () => {
        const methods = useForm<QrcodeFormValues>({
          resolver: zodResolver(qrcodeFormSchema),
          defaultValues,
        });

        return (
          <FormProvider {...methods}>
            <CardStyle />
            <div data-testid="logo-value">{methods.watch("styleLogo")}</div>
          </FormProvider>
        );
      };

      render(<TestComponent />);

      const fileInput = screen.getByLabelText(
        "로고 (선택)",
      ) as HTMLInputElement;

      // 작은 이미지 파일 생성
      const imageFile = new File(["fake image content"], "image.png", {
        type: "image/png",
      });

      // FileReader 모킹
      const mockFileReader = {
        readAsDataURL: jest.fn(),
        onload: null as any,
        result: "data:image/png;base64,ZmFrZSBpbWFnZSBjb250ZW50",
      };

      jest
        .spyOn(window, "FileReader")
        .mockImplementation(() => mockFileReader as any);

      fireEvent.change(fileInput, { target: { files: [imageFile] } });

      // onload 이벤트 시뮬레이션
      mockFileReader.onload({
        target: { result: mockFileReader.result },
      } as any);

      await waitFor(() => {
        expect(screen.getByTestId("logo-value")).toHaveTextContent(
          "data:image/png;base64,ZmFrZSBpbWFnZSBjb250ZW50",
        );
      });

      (window.FileReader as any).mockRestore();
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

    it('테두리 스타일이 "사용자 정의"일 때 모든 추가 필드가 표시되어야 한다', async () => {
      render(
        <TestWrapper initialValues={{ styleBorderStyle: "custom" }}>
          <CardStyle />
        </TestWrapper>,
      );

      // custom 모드에서만 표시되는 필드들
      expect(screen.getByText("안내 문구")).toBeInTheDocument();
      expect(screen.getByText("테두리 색상")).toBeInTheDocument();
      expect(screen.getByText("안내 문구 색상")).toBeInTheDocument();
      expect(screen.getByText("모서리 반지름")).toBeInTheDocument();
      expect(screen.getByText("테두리 굵기")).toBeInTheDocument();
      expect(screen.getByText("폰트 사이즈")).toBeInTheDocument();
      expect(screen.getByText("사용자 정의 모드:")).toBeInTheDocument();
    });

    it('테두리 스타일이 "둥근 모서리"일 때 모서리 반지름 필드만 추가로 표시되어야 한다', () => {
      render(
        <TestWrapper initialValues={{ styleBorderStyle: "rounded" }}>
          <CardStyle />
        </TestWrapper>,
      );

      expect(screen.getByText("모서리 반지름")).toBeInTheDocument();
      expect(screen.queryByText("안내 문구")).not.toBeInTheDocument();
      expect(screen.queryByText("사용자 정의 모드:")).not.toBeInTheDocument();
    });

    it('테두리 스타일이 "심플"일 때 테두리 색상 필드만 추가로 표시되어야 한다', () => {
      render(
        <TestWrapper initialValues={{ styleBorderStyle: "simple" }}>
          <CardStyle />
        </TestWrapper>,
      );

      expect(screen.getByText("테두리 색상")).toBeInTheDocument();
      expect(screen.queryByText("안내 문구")).not.toBeInTheDocument();
      expect(screen.queryByText("모서리 반지름")).not.toBeInTheDocument();
      expect(screen.queryByText("사용자 정의 모드:")).not.toBeInTheDocument();
    });
  });

  describe("범위 입력 필드", () => {
    it("모서리 반지름 슬라이더가 올바르게 동작해야 한다", async () => {
      render(
        <TestWrapper initialValues={{ styleBorderStyle: "custom" }}>
          <CardStyle />
        </TestWrapper>,
      );

      // 모서리 반지름 섹션에서 슬라이더 찾기
      const radiusLabel = screen.getByText("모서리 반지름");
      const radiusContainer = radiusLabel.closest(".space-y-2");
      const radiusSlider = radiusContainer?.querySelector(
        'input[type="range"][min="0"][max="50"]',
      ) as HTMLInputElement;

      expect(radiusSlider).toBeInTheDocument();
      expect(radiusSlider).toHaveAttribute("type", "range");
      expect(radiusSlider).toHaveAttribute("min", "0");
      expect(radiusSlider).toHaveAttribute("max", "50");

      fireEvent.change(radiusSlider, { target: { value: "25" } });

      await waitFor(() => {
        expect(screen.getByText("25px")).toBeInTheDocument();
      });
    });

    it("테두리 굵기 슬라이더가 올바르게 동작해야 한다", async () => {
      render(
        <TestWrapper initialValues={{ styleBorderStyle: "custom" }}>
          <CardStyle />
        </TestWrapper>,
      );

      // 테두리 굵기 섹션에서 슬라이더 찾기
      const widthLabel = screen.getByText("테두리 굵기");
      const widthContainer = widthLabel.closest(".space-y-2");
      const widthSlider = widthContainer?.querySelector(
        'input[type="range"][min="1"][max="20"]',
      ) as HTMLInputElement;

      expect(widthSlider).toBeInTheDocument();
      expect(widthSlider).toHaveAttribute("type", "range");
      expect(widthSlider).toHaveAttribute("min", "1");
      expect(widthSlider).toHaveAttribute("max", "20");

      fireEvent.change(widthSlider, { target: { value: "5" } });

      await waitFor(() => {
        expect(screen.getByText("5px")).toBeInTheDocument();
      });
    });

    it("폰트 사이즈 슬라이더가 올바르게 동작해야 한다", async () => {
      render(
        <TestWrapper initialValues={{ styleBorderStyle: "custom" }}>
          <CardStyle />
        </TestWrapper>,
      );

      // 폰트 사이즈 섹션에서 슬라이더 찾기
      const fontSizeLabel = screen.getByText("폰트 사이즈");
      const fontSizeContainer = fontSizeLabel.closest(".space-y-2");
      const fontSizeSlider = fontSizeContainer?.querySelector(
        'input[type="range"][min="8"][max="48"]',
      ) as HTMLInputElement;

      expect(fontSizeSlider).toBeInTheDocument();
      expect(fontSizeSlider).toHaveAttribute("type", "range");
      expect(fontSizeSlider).toHaveAttribute("min", "8");
      expect(fontSizeSlider).toHaveAttribute("max", "48");

      fireEvent.change(fontSizeSlider, { target: { value: "24" } });

      await waitFor(() => {
        expect(screen.getByText("24px")).toBeInTheDocument();
      });
    });
  });

  describe("레이아웃", () => {
    it("모든 필드가 전체 너비를 사용해야 한다", () => {
      render(
        <TestWrapper>
          <CardStyle />
        </TestWrapper>,
      );

      const cardContent = screen
        .getByTestId("card-style")
        .querySelector('[class*="grid-cols-1"]');
      expect(cardContent).toBeInTheDocument();
    });
  });

  describe("로고 이미지 미리보기", () => {
    it("로고가 설정되면 미리보기가 표시되어야 한다", () => {
      const initialValues = {
        ...defaultValues,
        styleLogo:
          "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==",
      };

      render(
        <TestWrapper initialValues={initialValues}>
          <CardStyle />
        </TestWrapper>,
      );

      const logoPreview = screen.getByAltText("로고 미리보기");
      expect(logoPreview).toBeInTheDocument();
      expect(logoPreview).toHaveAttribute("src", initialValues.styleLogo);
    });

    it("로고가 설정되지 않으면 미리보기가 표시되지 않아야 한다", () => {
      render(
        <TestWrapper>
          <CardStyle />
        </TestWrapper>,
      );

      const logoPreview = screen.queryByAltText("로고 미리보기");
      expect(logoPreview).not.toBeInTheDocument();
    });
  });
});
