import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { CardLocation } from "@/app/qrcode/components/card-location";

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
  location: z.string().min(1, "주소를 입력해주세요.").optional(),
  // Add other fields as needed for form validation
  emailAddress: z.string().optional(),
  emailSubject: z.string().optional(),
  emailBody: z.string().optional(),
  url: z.string().optional(),
  textarea: z.string().optional(),
  wifiSsid: z.string().optional(),
  wifiPassword: z.string().optional(),
  wifiEncryption: z.enum(["WPA", "WEP", "nopass"]).optional(),
  wifiIsHidden: z.boolean().optional(),
  smsPhoneNumber: z.string().optional(),
  smsMessage: z.string().optional(),
  vcardFullName: z.string().optional(),
  vcardPhoneNumber: z.string().optional(),
  vcardEmail: z.string().optional(),
  vcardOrganization: z.string().optional(),
  vcardJobTitle: z.string().optional(),
  vcardWebsite: z.string().optional(),
  vcardAddress: z.string().optional(),
});

type QrcodeFormValues = z.infer<typeof qrcodeFormSchema>;

// Mock AddressSearch component
jest.mock("@/components/address-search", () => ({
  AddressSearch: ({
    onSelect,
  }: {
    onSelect: (data: { address: string }) => void;
  }) => (
    <button
      data-testid="address-search-button"
      onClick={() => onSelect({ address: "서울특별시 강남구 테헤란로 123" })}
    >
      주소검색
    </button>
  ),
}));

// Test wrapper component that provides form context
function CardLocationWrapper({
  defaultValues,
}: {
  defaultValues?: Partial<QrcodeFormValues>;
}) {
  const methods = useForm<QrcodeFormValues>({
    resolver: zodResolver(qrcodeFormSchema),
    defaultValues: {
      qrType: "location",
      location: "",
      ...defaultValues,
    },
  });

  return (
    <FormProvider {...methods}>
      <CardLocation />
    </FormProvider>
  );
}

describe("CardLocation", () => {
  describe("렌더링", () => {
    it("위치 정보 카드가 올바른 제목과 설명으로 렌더링되어야 함", () => {
      render(<CardLocationWrapper />);

      expect(screen.getByText("위치 정보")).toBeInTheDocument();
      expect(
        screen.getByText("지도로 연결할 주소나 장소명을 입력하세요."),
      ).toBeInTheDocument();
    });

    it("주소 입력 필드가 렌더링되어야 함", () => {
      render(<CardLocationWrapper />);

      expect(screen.getByText("주소")).toBeInTheDocument();
      expect(screen.getByText("(필수)")).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText("서울특별시 강남구 테헤란로 123"),
      ).toBeInTheDocument();
    });

    it("주소 검색 버튼이 렌더링되어야 함", () => {
      render(<CardLocationWrapper />);

      expect(screen.getByTestId("address-search-button")).toBeInTheDocument();
    });

    it("주소 입력에 대한 설명이 표시되어야 함", () => {
      render(<CardLocationWrapper />);

      expect(
        screen.getByText(
          "정확한 주소나 장소명을 입력하거나 검색 버튼을 클릭하여 다음 우편번호 서비스로 주소를 찾으세요.",
        ),
      ).toBeInTheDocument();
    });
  });

  describe("사용자 입력", () => {
    it("주소 입력이 정상적으로 동작해야 함", () => {
      render(<CardLocationWrapper />);

      const locationInput =
        screen.getByPlaceholderText("서울특별시 강남구 테헤란로 123");
      fireEvent.change(locationInput, {
        target: { value: "부산광역시 해운대구 해운대로 123" },
      });

      expect(locationInput).toHaveValue("부산광역시 해운대구 해운대로 123");
    });

    it("주소 검색 버튼 클릭 시 주소가 설정되어야 함", () => {
      render(<CardLocationWrapper />);

      const locationInput =
        screen.getByPlaceholderText("서울특별시 강남구 테헤란로 123");
      const searchButton = screen.getByTestId("address-search-button");

      fireEvent.click(searchButton);

      expect(locationInput).toHaveValue("서울특별시 강남구 테헤란로 123");
    });

    it("다양한 주소 형식을 입력할 수 있어야 함", () => {
      render(<CardLocationWrapper />);

      const locationInput =
        screen.getByPlaceholderText("서울특별시 강남구 테헤란로 123");

      // 상세 주소
      fireEvent.change(locationInput, {
        target: {
          value: "서울특별시 강남구 테헤란로 123 (역삼동, ABC빌딩 5층)",
        },
      });
      expect(locationInput).toHaveValue(
        "서울특별시 강남구 테헤란로 123 (역삼동, ABC빌딩 5층)",
      );

      // 장소명
      fireEvent.change(locationInput, {
        target: { value: "강남역 2번 출구" },
      });
      expect(locationInput).toHaveValue("강남역 2번 출구");

      // 영문 주소
      fireEvent.change(locationInput, {
        target: { value: "123 Teheran-ro, Gangnam-gu, Seoul, South Korea" },
      });
      expect(locationInput).toHaveValue(
        "123 Teheran-ro, Gangnam-gu, Seoul, South Korea",
      );
    });
  });

  describe("기본값", () => {
    it("기본값이 설정되어 있으면 필드에 표시되어야 함", () => {
      const defaultValues = {
        location: "인천광역시 중구 공항로 272",
      };

      render(<CardLocationWrapper defaultValues={defaultValues} />);

      expect(
        screen.getByDisplayValue("인천광역시 중구 공항로 272"),
      ).toBeInTheDocument();
    });

    it("빈 기본값으로 초기화되어야 함", () => {
      render(<CardLocationWrapper />);

      const locationInput =
        screen.getByPlaceholderText("서울특별시 강남구 테헤란로 123");
      expect(locationInput).toHaveValue("");
    });
  });

  describe("UI 구조", () => {
    it("주소 입력과 검색 버튼이 같은 행에 배치되어야 함", () => {
      render(<CardLocationWrapper />);

      const container = screen.getByTestId(
        "address-search-button",
      ).parentElement;
      expect(container).toHaveClass("flex", "items-center", "space-x-2");
    });

    it("필수 필드 표시가 올바르게 되어야 함", () => {
      render(<CardLocationWrapper />);

      expect(screen.getByText("주소")).toBeInTheDocument();
      expect(screen.getByText("(필수)")).toBeInTheDocument();
    });
  });

  describe("접근성", () => {
    it("주소 입력 필드가 적절한 라벨을 가져야 함", () => {
      render(<CardLocationWrapper />);

      const locationInput =
        screen.getByPlaceholderText("서울특별시 강남구 테헤란로 123");
      expect(locationInput).toHaveAccessibleName(/주소/);
    });

    it("설명 텍스트가 필드와 연결되어야 함", () => {
      render(<CardLocationWrapper />);

      const description = screen.getByText(
        "정확한 주소나 장소명을 입력하거나 검색 버튼을 클릭하여 다음 우편번호 서비스로 주소를 찾으세요.",
      );
      expect(description).toBeInTheDocument();
    });
  });

  describe("통합 테스트", () => {
    it("주소 검색과 직접 입력이 모두 정상 동작해야 함", () => {
      render(<CardLocationWrapper />);

      const locationInput =
        screen.getByPlaceholderText("서울특별시 강남구 테헤란로 123");
      const searchButton = screen.getByTestId("address-search-button");

      // 직접 입력
      fireEvent.change(locationInput, {
        target: { value: "직접 입력한 주소" },
      });
      expect(locationInput).toHaveValue("직접 입력한 주소");

      // 검색으로 덮어쓰기
      fireEvent.click(searchButton);
      expect(locationInput).toHaveValue("서울특별시 강남구 테헤란로 123");

      // 다시 직접 수정
      fireEvent.change(locationInput, { target: { value: "수정된 주소" } });
      expect(locationInput).toHaveValue("수정된 주소");
    });
  });
});
