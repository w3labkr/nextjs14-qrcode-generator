import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { CardEmail } from "@/app/qrcode/components/card-email";

// Define the schema directly in the test to avoid import issues
const qrcodeFormSchema = z.object({
  qrType: z.enum([
    "url",
    "textarea",
    "wifi",
    "email",
    "sms",
    "vcard",
    "location",
  ]),
  emailAddress: z
    .string()
    .email("올바른 이메일 형식을 입력해주세요.")
    .optional(),
  emailSubject: z.string().optional(),
  emailBody: z.string().optional(),
  // Add other fields as needed for form validation
  url: z.string().optional(),
  textarea: z.string().optional(),
  wifiSsid: z.string().optional(),
  wifiPassword: z.string().optional(),
  wifiEncryption: z.enum(["WPA", "WEP", "nopass"]).optional(),
  wifiIsHidden: z.boolean().optional(),
  smsPhoneNumber: z.string().optional(),
  smsMessage: z.string().optional(),
  location: z.string().optional(),
  vcardFullName: z.string().optional(),
  vcardPhoneNumber: z.string().optional(),
  vcardEmail: z.string().optional(),
  vcardOrganization: z.string().optional(),
  vcardJobTitle: z.string().optional(),
  vcardWebsite: z.string().optional(),
  vcardAddress: z.string().optional(),
});

type QrcodeFormValues = z.infer<typeof qrcodeFormSchema>;

// Test wrapper component that provides form context
function CardEmailWrapper({
  defaultValues,
}: {
  defaultValues?: Partial<QrcodeFormValues>;
}) {
  const methods = useForm<QrcodeFormValues>({
    resolver: zodResolver(qrcodeFormSchema),
    defaultValues: {
      qrType: "email",
      emailAddress: "",
      emailSubject: "",
      emailBody: "",
      ...defaultValues,
    },
  });

  return (
    <FormProvider {...methods}>
      <CardEmail />
    </FormProvider>
  );
}

describe("CardEmail", () => {
  describe("렌더링", () => {
    it("이메일 카드가 올바른 제목과 설명으로 렌더링되어야 함", () => {
      render(<CardEmailWrapper />);

      expect(screen.getByText("이메일")).toBeInTheDocument();
      expect(
        screen.getByText("이메일 주소와 제목, 내용을 입력하세요."),
      ).toBeInTheDocument();
    });

    it("모든 필수 폼 필드가 렌더링되어야 함", () => {
      render(<CardEmailWrapper />);

      // 이메일 주소 필드 (필수)
      expect(screen.getByText("이메일 주소")).toBeInTheDocument();
      expect(screen.getByText("(필수)")).toBeInTheDocument();
      expect(screen.getByPlaceholderText("me@example.com")).toBeInTheDocument();

      // 제목 필드 (선택)
      expect(screen.getByText("제목")).toBeInTheDocument();
      expect(screen.getAllByText("(선택)")[0]).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText("제목을 입력하세요."),
      ).toBeInTheDocument();

      // 내용 필드 (선택)
      expect(screen.getByText("내용")).toBeInTheDocument();
      expect(screen.getAllByText("(선택)")[1]).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText("내용을 입력하세요."),
      ).toBeInTheDocument();
    });

    it("이메일 주소 입력 필드가 이메일 타입이어야 함", () => {
      render(<CardEmailWrapper />);

      const emailInput = screen.getByPlaceholderText("me@example.com");
      expect(emailInput).toHaveAttribute("type", "email");
    });

    it("내용 필드가 텍스트 영역이고 최소 높이가 설정되어야 함", () => {
      render(<CardEmailWrapper />);

      const bodyTextarea = screen.getByPlaceholderText("내용을 입력하세요.");
      expect(bodyTextarea.tagName).toBe("TEXTAREA");
      expect(bodyTextarea).toHaveClass("min-h-[100px]");
    });
  });

  describe("사용자 입력", () => {
    it("이메일 주소 입력이 정상적으로 동작해야 함", () => {
      render(<CardEmailWrapper />);

      const emailInput = screen.getByPlaceholderText("me@example.com");
      fireEvent.change(emailInput, { target: { value: "test@example.com" } });

      expect(emailInput).toHaveValue("test@example.com");
    });

    it("제목 입력이 정상적으로 동작해야 함", () => {
      render(<CardEmailWrapper />);

      const subjectInput = screen.getByPlaceholderText("제목을 입력하세요.");
      fireEvent.change(subjectInput, { target: { value: "테스트 제목" } });

      expect(subjectInput).toHaveValue("테스트 제목");
    });

    it("내용 입력이 정상적으로 동작해야 함", () => {
      render(<CardEmailWrapper />);

      const bodyTextarea = screen.getByPlaceholderText("내용을 입력하세요.");
      fireEvent.change(bodyTextarea, {
        target: { value: "테스트 내용입니다." },
      });

      expect(bodyTextarea).toHaveValue("테스트 내용입니다.");
    });

    it("모든 필드에 값을 입력할 수 있어야 함", () => {
      render(<CardEmailWrapper />);

      const emailInput = screen.getByPlaceholderText("me@example.com");
      const subjectInput = screen.getByPlaceholderText("제목을 입력하세요.");
      const bodyTextarea = screen.getByPlaceholderText("내용을 입력하세요.");

      fireEvent.change(emailInput, { target: { value: "user@test.com" } });
      fireEvent.change(subjectInput, { target: { value: "안녕하세요" } });
      fireEvent.change(bodyTextarea, {
        target: { value: "안녕하세요!\n\n문의가 있습니다." },
      });

      expect(emailInput).toHaveValue("user@test.com");
      expect(subjectInput).toHaveValue("안녕하세요");
      expect(bodyTextarea).toHaveValue("안녕하세요!\n\n문의가 있습니다.");
    });
  });

  describe("기본값", () => {
    it("기본값이 설정되어 있으면 필드에 표시되어야 함", () => {
      const defaultValues = {
        emailAddress: "default@example.com",
        emailSubject: "기본 제목",
        emailBody: "기본 내용",
      };

      render(<CardEmailWrapper defaultValues={defaultValues} />);

      expect(
        screen.getByDisplayValue("default@example.com"),
      ).toBeInTheDocument();
      expect(screen.getByDisplayValue("기본 제목")).toBeInTheDocument();
      expect(screen.getByDisplayValue("기본 내용")).toBeInTheDocument();
    });

    it("빈 기본값으로 초기화되어야 함", () => {
      render(<CardEmailWrapper />);

      const emailInput = screen.getByPlaceholderText("me@example.com");
      const subjectInput = screen.getByPlaceholderText("제목을 입력하세요.");
      const bodyTextarea = screen.getByPlaceholderText("내용을 입력하세요.");

      expect(emailInput).toHaveValue("");
      expect(subjectInput).toHaveValue("");
      expect(bodyTextarea).toHaveValue("");
    });
  });

  describe("접근성", () => {
    it("모든 입력 필드가 적절한 라벨을 가져야 함", () => {
      render(<CardEmailWrapper />);

      const emailInput = screen.getByPlaceholderText("me@example.com");
      const subjectInput = screen.getByPlaceholderText("제목을 입력하세요.");
      const bodyTextarea = screen.getByPlaceholderText("내용을 입력하세요.");

      expect(emailInput).toHaveAccessibleName(/이메일 주소/);
      expect(subjectInput).toHaveAccessibleName(/제목/);
      expect(bodyTextarea).toHaveAccessibleName(/내용/);
    });

    it("필수 필드 표시가 올바르게 되어야 함", () => {
      render(<CardEmailWrapper />);

      // 이메일 주소는 필수 필드
      expect(screen.getByText("이메일 주소")).toBeInTheDocument();
      expect(screen.getByText("(필수)")).toBeInTheDocument();

      // 제목과 내용은 선택 필드
      expect(screen.getAllByText("(선택)")).toHaveLength(2);
    });
  });
});
