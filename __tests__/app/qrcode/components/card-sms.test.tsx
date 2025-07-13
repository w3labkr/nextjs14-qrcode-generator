import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { CardSms } from '@/app/qrcode/components/card-sms';

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
  smsPhoneNumber: z.string().min(1, "전화번호를 입력해주세요.").optional(),
  smsMessage: z.string().optional(),
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
function CardSmsWrapper({ defaultValues }: { defaultValues?: Partial<QrcodeFormValues> }) {
  const methods = useForm<QrcodeFormValues>({
    resolver: zodResolver(qrcodeFormSchema),
    defaultValues: {
      qrType: 'sms',
      smsPhoneNumber: '',
      smsMessage: '',
      ...defaultValues,
    },
  });

  return (
    <FormProvider {...methods}>
      <CardSms />
    </FormProvider>
  );
}

describe('CardSms', () => {
  describe('렌더링', () => {
    it('SMS 카드가 올바른 제목과 설명으로 렌더링되어야 함', () => {
      render(<CardSmsWrapper />);
      
      expect(screen.getByText('SMS')).toBeInTheDocument();
      expect(screen.getByText('전화번호와 메시지를 입력하세요.')).toBeInTheDocument();
    });

    it('모든 폼 필드가 렌더링되어야 함', () => {
      render(<CardSmsWrapper />);
      
      // 전화번호 필드 (필수)
      expect(screen.getByText('전화번호')).toBeInTheDocument();
      expect(screen.getByText('(필수)')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('010-1234-5678')).toBeInTheDocument();
      
      // 메시지 필드 (선택)
      expect(screen.getByText('메시지')).toBeInTheDocument();
      expect(screen.getByText('(선택)')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('메시지를 입력하세요.')).toBeInTheDocument();
    });

    it('전화번호 입력 필드가 전화번호 타입이어야 함', () => {
      render(<CardSmsWrapper />);
      
      const phoneInput = screen.getByPlaceholderText('010-1234-5678');
      expect(phoneInput).toHaveAttribute('type', 'tel');
    });

    it('메시지 필드가 텍스트 영역이고 최소 높이가 설정되어야 함', () => {
      render(<CardSmsWrapper />);
      
      const messageTextarea = screen.getByPlaceholderText('메시지를 입력하세요.');
      expect(messageTextarea.tagName).toBe('TEXTAREA');
      expect(messageTextarea).toHaveClass('min-h-[100px]');
    });
  });

  describe('사용자 입력', () => {
    it('전화번호 입력이 정상적으로 동작해야 함', () => {
      render(<CardSmsWrapper />);
      
      const phoneInput = screen.getByPlaceholderText('010-1234-5678');
      fireEvent.change(phoneInput, { target: { value: '010-9876-5432' } });
      
      expect(phoneInput).toHaveValue('010-9876-5432');
    });

    it('메시지 입력이 정상적으로 동작해야 함', () => {
      render(<CardSmsWrapper />);
      
      const messageTextarea = screen.getByPlaceholderText('메시지를 입력하세요.');
      fireEvent.change(messageTextarea, { target: { value: '안녕하세요! 테스트 메시지입니다.' } });
      
      expect(messageTextarea).toHaveValue('안녕하세요! 테스트 메시지입니다.');
    });

    it('다양한 전화번호 형식을 입력할 수 있어야 함', () => {
      render(<CardSmsWrapper />);
      
      const phoneInput = screen.getByPlaceholderText('010-1234-5678');
      
      // 하이픈 포함
      fireEvent.change(phoneInput, { target: { value: '02-123-4567' } });
      expect(phoneInput).toHaveValue('02-123-4567');
      
      // 하이픈 없음
      fireEvent.change(phoneInput, { target: { value: '01012345678' } });
      expect(phoneInput).toHaveValue('01012345678');
      
      // 국가번호 포함
      fireEvent.change(phoneInput, { target: { value: '+82-10-1234-5678' } });
      expect(phoneInput).toHaveValue('+82-10-1234-5678');
    });

    it('긴 메시지를 입력할 수 있어야 함', () => {
      render(<CardSmsWrapper />);
      
      const messageTextarea = screen.getByPlaceholderText('메시지를 입력하세요.');
      const longMessage = '이것은 매우 긴 메시지입니다. '.repeat(10) + 
        '줄바꿈도 포함됩니다.\n\n새로운 단락입니다.\n\n감사합니다.';
      
      fireEvent.change(messageTextarea, { target: { value: longMessage } });
      
      expect(messageTextarea).toHaveValue(longMessage);
    });

    it('모든 필드에 값을 입력할 수 있어야 함', () => {
      render(<CardSmsWrapper />);
      
      const phoneInput = screen.getByPlaceholderText('010-1234-5678');
      const messageTextarea = screen.getByPlaceholderText('메시지를 입력하세요.');
      
      fireEvent.change(phoneInput, { target: { value: '010-1111-2222' } });
      fireEvent.change(messageTextarea, { target: { value: '예약 확인 메시지입니다.\n시간: 오후 3시\n장소: 강남역' } });
      
      expect(phoneInput).toHaveValue('010-1111-2222');
      expect(messageTextarea).toHaveValue('예약 확인 메시지입니다.\n시간: 오후 3시\n장소: 강남역');
    });
  });

  describe('기본값', () => {
    it('기본값이 설정되어 있으면 필드에 표시되어야 함', () => {
      const defaultValues = {
        smsPhoneNumber: '010-5555-6666',
        smsMessage: '기본 메시지 내용',
      };
      
      render(<CardSmsWrapper defaultValues={defaultValues} />);
      
      expect(screen.getByDisplayValue('010-5555-6666')).toBeInTheDocument();
      expect(screen.getByDisplayValue('기본 메시지 내용')).toBeInTheDocument();
    });

    it('빈 기본값으로 초기화되어야 함', () => {
      render(<CardSmsWrapper />);
      
      const phoneInput = screen.getByPlaceholderText('010-1234-5678');
      const messageTextarea = screen.getByPlaceholderText('메시지를 입력하세요.');
      
      expect(phoneInput).toHaveValue('');
      expect(messageTextarea).toHaveValue('');
    });
  });

  describe('접근성', () => {
    it('모든 입력 필드가 적절한 라벨을 가져야 함', () => {
      render(<CardSmsWrapper />);
      
      const phoneInput = screen.getByPlaceholderText('010-1234-5678');
      const messageTextarea = screen.getByPlaceholderText('메시지를 입력하세요.');
      
      expect(phoneInput).toHaveAccessibleName(/전화번호/);
      expect(messageTextarea).toHaveAccessibleName(/메시지/);
    });

    it('필수 필드와 선택 필드 표시가 올바르게 되어야 함', () => {
      render(<CardSmsWrapper />);
      
      // 전화번호는 필수 필드
      expect(screen.getByText('전화번호')).toBeInTheDocument();
      expect(screen.getByText('(필수)')).toBeInTheDocument();
      
      // 메시지는 선택 필드
      expect(screen.getByText('메시지')).toBeInTheDocument();
      expect(screen.getByText('(선택)')).toBeInTheDocument();
    });
  });

  describe('사용 사례', () => {
    it('비즈니스 SMS 정보를 입력할 수 있어야 함', () => {
      render(<CardSmsWrapper />);
      
      const phoneInput = screen.getByPlaceholderText('010-1234-5678');
      const messageTextarea = screen.getByPlaceholderText('메시지를 입력하세요.');
      
      fireEvent.change(phoneInput, { target: { value: '02-123-4567' } });
      fireEvent.change(messageTextarea, { 
        target: { 
          value: '[ABC식당] 예약 확인\n날짜: 2024년 1월 15일\n시간: 오후 7시\n인원: 4명\n문의: 02-123-4567' 
        } 
      });
      
      expect(phoneInput).toHaveValue('02-123-4567');
      expect(messageTextarea).toHaveValue('[ABC식당] 예약 확인\n날짜: 2024년 1월 15일\n시간: 오후 7시\n인원: 4명\n문의: 02-123-4567');
    });

    it('개인 연락처 정보를 입력할 수 있어야 함', () => {
      render(<CardSmsWrapper />);
      
      const phoneInput = screen.getByPlaceholderText('010-1234-5678');
      const messageTextarea = screen.getByPlaceholderText('메시지를 입력하세요.');
      
      fireEvent.change(phoneInput, { target: { value: '010-9999-8888' } });
      fireEvent.change(messageTextarea, { 
        target: { 
          value: '안녕하세요! 홍길동입니다.\n연락 주세요 :)' 
        } 
      });
      
      expect(phoneInput).toHaveValue('010-9999-8888');
      expect(messageTextarea).toHaveValue('안녕하세요! 홍길동입니다.\n연락 주세요 :)');
    });
  });
});
