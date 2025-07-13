import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { CardWifi } from "@/app/qrcode/components/card-wifi";

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
  wifiSsid: z
    .string()
    .min(1, "Wi-Fi 네트워크 이름(SSID)을 입력해주세요.")
    .optional(),
  wifiPassword: z.string().min(1, "Wi-Fi 비밀번호를 입력해주세요.").optional(),
  wifiEncryption: z.enum(["WPA", "WEP", "nopass"]).optional(),
  wifiIsHidden: z.boolean().optional(),
  // Add other fields as needed for form validation
  emailAddress: z.string().optional(),
  emailSubject: z.string().optional(),
  emailBody: z.string().optional(),
  url: z.string().optional(),
  textarea: z.string().optional(),
  location: z.string().optional(),
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

// Test wrapper component that provides form context
function CardWifiWrapper({
  defaultValues,
}: {
  defaultValues?: Partial<QrcodeFormValues>;
}) {
  const methods = useForm<QrcodeFormValues>({
    resolver: zodResolver(qrcodeFormSchema),
    defaultValues: {
      qrType: "wifi",
      wifiSsid: "",
      wifiPassword: "",
      wifiEncryption: "WPA",
      wifiIsHidden: false,
      ...defaultValues,
    },
  });

  return (
    <FormProvider {...methods}>
      <CardWifi />
    </FormProvider>
  );
}

describe("CardWifi", () => {
  describe("렌더링", () => {
    it("Wi-Fi 네트워크 카드가 올바른 제목과 설명으로 렌더링되어야 함", () => {
      render(<CardWifiWrapper />);

      expect(screen.getByText("Wi-Fi 네트워크")).toBeInTheDocument();
      expect(
        screen.getByText("QR 코드에 포함할 Wi-Fi 네트워크 정보를 입력하세요."),
      ).toBeInTheDocument();
    });

    it("모든 Wi-Fi 설정 필드가 렌더링되어야 함", () => {
      render(<CardWifiWrapper />);

      // SSID 필드 (필수)
      expect(screen.getByText("네트워크 이름 (SSID)")).toBeInTheDocument();
      expect(screen.getAllByText("(필수)")[0]).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText("Wi-Fi 네트워크 이름을 입력하세요."),
      ).toBeInTheDocument();

      // 비밀번호 필드 (필수)
      expect(screen.getByText("비밀번호")).toBeInTheDocument();
      expect(screen.getAllByText("(필수)")[1]).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText("Wi-Fi 비밀번호를 입력하세요."),
      ).toBeInTheDocument();

      // 암호화 방식 선택
      expect(screen.getByText("암호화 방식")).toBeInTheDocument();
      expect(screen.getByRole("combobox")).toBeInTheDocument();

      // 숨겨진 네트워크 체크박스
      expect(screen.getByText("숨겨진 네트워크")).toBeInTheDocument();
      expect(screen.getByRole("checkbox")).toBeInTheDocument();
    });

    it("비밀번호 필드가 password 타입이어야 함", () => {
      render(<CardWifiWrapper />);

      const passwordInput =
        screen.getByPlaceholderText("Wi-Fi 비밀번호를 입력하세요.");
      expect(passwordInput).toHaveAttribute("type", "password");
    });

    it("WiFi QR 코드 사용 가이드가 표시되어야 함", () => {
      render(<CardWifiWrapper />);

      expect(screen.getByText("WiFi QR 코드 연결 가이드:")).toBeInTheDocument();
      expect(
        screen.getByText(
          "스마트폰 카메라 앱을 열거나 QR 코드 스캐너를 사용하세요",
        ),
      ).toBeInTheDocument();
      expect(
        screen.getByText("QR 코드를 스캔하면 WiFi 연결 알림이 나타납니다"),
      ).toBeInTheDocument();
      expect(
        screen.getByText("알림을 탭하여 자동으로 WiFi에 연결하세요"),
      ).toBeInTheDocument();
      expect(
        screen.getByText(
          "연결이 되지 않으면 WiFi 설정에서 수동으로 확인해보세요",
        ),
      ).toBeInTheDocument();
      expect(
        screen.getByText(
          "일부 구형 기기는 WiFi QR 코드를 지원하지 않을 수 있습니다.",
        ),
      ).toBeInTheDocument();
    });
  });

  describe("사용자 입력", () => {
    it("네트워크 이름(SSID) 입력이 정상적으로 동작해야 함", () => {
      render(<CardWifiWrapper />);

      const ssidInput = screen.getByPlaceholderText(
        "Wi-Fi 네트워크 이름을 입력하세요.",
      );
      fireEvent.change(ssidInput, { target: { value: "MyHomeWiFi" } });

      expect(ssidInput).toHaveValue("MyHomeWiFi");
    });

    it("비밀번호 입력이 정상적으로 동작해야 함", () => {
      render(<CardWifiWrapper />);

      const passwordInput =
        screen.getByPlaceholderText("Wi-Fi 비밀번호를 입력하세요.");
      fireEvent.change(passwordInput, {
        target: { value: "mySecretPassword123" },
      });

      expect(passwordInput).toHaveValue("mySecretPassword123");
    });

    it("암호화 방식 선택이 정상적으로 동작해야 함", () => {
      render(<CardWifiWrapper />);

      // Select 트리거 클릭
      const selectTrigger = screen.getByRole("combobox");
      fireEvent.click(selectTrigger);

      // WEP 선택
      const wepOption = screen.getByText("WEP");
      fireEvent.click(wepOption);

      // 선택된 값 확인 (Select 컴포넌트의 특성상 value 확인은 복잡하므로 텍스트 확인)
      expect(screen.getByText("WEP")).toBeInTheDocument();
    });

    it("숨겨진 네트워크 체크박스가 정상적으로 동작해야 함", () => {
      render(<CardWifiWrapper />);

      const hiddenCheckbox = screen.getByRole("checkbox");

      // 초기 상태는 체크되지 않음
      expect(hiddenCheckbox).not.toBeChecked();

      // 체크박스 클릭
      fireEvent.click(hiddenCheckbox);
      expect(hiddenCheckbox).toBeChecked();

      // 다시 클릭해서 해제
      fireEvent.click(hiddenCheckbox);
      expect(hiddenCheckbox).not.toBeChecked();
    });

    it("다양한 WiFi 네트워크 이름을 입력할 수 있어야 함", () => {
      render(<CardWifiWrapper />);

      const ssidInput = screen.getByPlaceholderText(
        "Wi-Fi 네트워크 이름을 입력하세요.",
      );

      // 영문 네트워크명
      fireEvent.change(ssidInput, { target: { value: "CoffeeShop_WiFi" } });
      expect(ssidInput).toHaveValue("CoffeeShop_WiFi");

      // 한글 네트워크명
      fireEvent.change(ssidInput, { target: { value: "우리집와이파이" } });
      expect(ssidInput).toHaveValue("우리집와이파이");

      // 숫자와 특수문자 포함
      fireEvent.change(ssidInput, { target: { value: "Home-WiFi-5G_2024" } });
      expect(ssidInput).toHaveValue("Home-WiFi-5G_2024");
    });

    it("복잡한 WiFi 비밀번호를 입력할 수 있어야 함", () => {
      render(<CardWifiWrapper />);

      const passwordInput =
        screen.getByPlaceholderText("Wi-Fi 비밀번호를 입력하세요.");
      const complexPassword = "MyVerySecure@WiFiPassword123!";

      fireEvent.change(passwordInput, { target: { value: complexPassword } });
      expect(passwordInput).toHaveValue(complexPassword);
    });
  });

  describe("암호화 방식 선택", () => {
    it("모든 암호화 방식 옵션이 제공되어야 함", () => {
      render(<CardWifiWrapper />);

      const selectTrigger = screen.getByRole("combobox");
      fireEvent.click(selectTrigger);

      // 옵션들이 드롭다운에 표시되는지 확인 (역할이나 다른 선택자 사용)
      expect(screen.getAllByText("WPA")).toHaveLength(2); // 선택된 값과 옵션으로 2개
      expect(screen.getByText("WEP")).toBeInTheDocument();
      expect(screen.getByText("암호 없음")).toBeInTheDocument();
    });

    it("암호 없음 옵션을 선택할 수 있어야 함", () => {
      render(<CardWifiWrapper />);

      const selectTrigger = screen.getByRole("combobox");
      fireEvent.click(selectTrigger);

      const noPassOption = screen.getByText("암호 없음");
      fireEvent.click(noPassOption);

      expect(screen.getByText("암호 없음")).toBeInTheDocument();
    });
  });

  describe("기본값", () => {
    it("기본값이 설정되어 있으면 필드에 표시되어야 함", () => {
      const defaultValues = {
        wifiSsid: "TestNetwork",
        wifiPassword: "testpass123",
        wifiEncryption: "WEP" as const,
        wifiIsHidden: true,
      };

      render(<CardWifiWrapper defaultValues={defaultValues} />);

      expect(screen.getByDisplayValue("TestNetwork")).toBeInTheDocument();
      expect(screen.getByDisplayValue("testpass123")).toBeInTheDocument();
      expect(screen.getByText("WEP")).toBeInTheDocument(); // 선택된 값은 텍스트로 확인
      expect(screen.getByRole("checkbox")).toBeChecked();
    });

    it("빈 기본값으로 초기화되어야 함", () => {
      render(<CardWifiWrapper />);

      const ssidInput = screen.getByPlaceholderText(
        "Wi-Fi 네트워크 이름을 입력하세요.",
      );
      const passwordInput =
        screen.getByPlaceholderText("Wi-Fi 비밀번호를 입력하세요.");
      const hiddenCheckbox = screen.getByRole("checkbox");

      expect(ssidInput).toHaveValue("");
      expect(passwordInput).toHaveValue("");
      expect(hiddenCheckbox).not.toBeChecked();
    });
  });

  describe("접근성", () => {
    it("모든 입력 필드가 적절한 라벨을 가져야 함", () => {
      render(<CardWifiWrapper />);

      const ssidInput = screen.getByPlaceholderText(
        "Wi-Fi 네트워크 이름을 입력하세요.",
      );
      const passwordInput =
        screen.getByPlaceholderText("Wi-Fi 비밀번호를 입력하세요.");
      const selectTrigger = screen.getByRole("combobox");
      const hiddenCheckbox = screen.getByRole("checkbox");

      expect(ssidInput).toHaveAccessibleName(/네트워크 이름/);
      expect(passwordInput).toHaveAccessibleName(/비밀번호/);
      expect(selectTrigger).toHaveAccessibleName(/암호화 방식/);
      expect(hiddenCheckbox).toHaveAccessibleName(/숨겨진 네트워크/);
    });

    it("필수 필드 표시가 올바르게 되어야 함", () => {
      render(<CardWifiWrapper />);

      expect(screen.getByText("네트워크 이름 (SSID)")).toBeInTheDocument();
      expect(screen.getByText("비밀번호")).toBeInTheDocument();
      expect(screen.getAllByText("(필수)")).toHaveLength(2);
    });

    it("체크박스와 라벨이 올바르게 연결되어야 함", () => {
      render(<CardWifiWrapper />);

      const checkbox = screen.getByRole("checkbox");
      const label = screen.getByText("숨겨진 네트워크");

      // 라벨 클릭으로 체크박스 토글 가능 여부 확인
      fireEvent.click(label);
      expect(checkbox).toBeChecked();
    });
  });

  describe("사용 사례", () => {
    it("일반 가정용 WiFi 설정을 입력할 수 있어야 함", () => {
      render(<CardWifiWrapper />);

      const ssidInput = screen.getByPlaceholderText(
        "Wi-Fi 네트워크 이름을 입력하세요.",
      );
      const passwordInput =
        screen.getByPlaceholderText("Wi-Fi 비밀번호를 입력하세요.");
      const selectTrigger = screen.getByRole("combobox");

      fireEvent.change(ssidInput, { target: { value: "Kim_Family_WiFi" } });
      fireEvent.change(passwordInput, {
        target: { value: "familyPassword2024" },
      });

      // WPA 선택 (기본값이므로 이미 선택됨)
      expect(screen.getByText("WPA")).toBeInTheDocument();

      expect(ssidInput).toHaveValue("Kim_Family_WiFi");
      expect(passwordInput).toHaveValue("familyPassword2024");
    });

    it("게스트 WiFi 설정을 입력할 수 있어야 함", () => {
      render(<CardWifiWrapper />);

      const ssidInput = screen.getByPlaceholderText(
        "Wi-Fi 네트워크 이름을 입력하세요.",
      );
      const passwordInput =
        screen.getByPlaceholderText("Wi-Fi 비밀번호를 입력하세요.");
      const selectTrigger = screen.getByRole("combobox");

      fireEvent.change(ssidInput, { target: { value: "Guest_Network" } });
      fireEvent.change(passwordInput, { target: { value: "guest123" } });

      // WEP 선택
      fireEvent.click(selectTrigger);
      fireEvent.click(screen.getByText("WEP"));

      expect(ssidInput).toHaveValue("Guest_Network");
      expect(passwordInput).toHaveValue("guest123");
      expect(screen.getByText("WEP")).toBeInTheDocument(); // 선택된 값은 텍스트로 확인
    });

    it("오픈 WiFi 설정을 입력할 수 있어야 함", () => {
      render(<CardWifiWrapper />);

      const ssidInput = screen.getByPlaceholderText(
        "Wi-Fi 네트워크 이름을 입력하세요.",
      );
      const selectTrigger = screen.getByRole("combobox");

      fireEvent.change(ssidInput, { target: { value: "Free_Public_WiFi" } });

      // 암호 없음 선택
      fireEvent.click(selectTrigger);
      fireEvent.click(screen.getByText("암호 없음"));

      expect(ssidInput).toHaveValue("Free_Public_WiFi");
      expect(screen.getByText("암호 없음")).toBeInTheDocument(); // 선택된 값은 텍스트로 확인
    });

    it("숨겨진 네트워크 설정을 입력할 수 있어야 함", () => {
      render(<CardWifiWrapper />);

      const ssidInput = screen.getByPlaceholderText(
        "Wi-Fi 네트워크 이름을 입력하세요.",
      );
      const passwordInput =
        screen.getByPlaceholderText("Wi-Fi 비밀번호를 입력하세요.");
      const hiddenCheckbox = screen.getByRole("checkbox");

      fireEvent.change(ssidInput, { target: { value: "Hidden_Network" } });
      fireEvent.change(passwordInput, { target: { value: "secretPassword" } });
      fireEvent.click(hiddenCheckbox);

      expect(ssidInput).toHaveValue("Hidden_Network");
      expect(passwordInput).toHaveValue("secretPassword");
      expect(hiddenCheckbox).toBeChecked();
    });
  });
});
