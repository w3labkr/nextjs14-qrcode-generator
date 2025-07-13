import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { CardVCard } from '@/app/qrcode/components/card-vcard';

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
  vcardFullName: z.string().min(1, "이름을 입력해주세요.").optional(),
  vcardPhoneNumber: z.string().optional(),
  vcardEmail: z.string().optional(),
  vcardOrganization: z.string().optional(),
  vcardJobTitle: z.string().optional(),
  vcardWebsite: z.string().optional(),
  vcardAddress: z.string().optional(),
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
  smsPhoneNumber: z.string().optional(),
  smsMessage: z.string().optional(),
});

type QrcodeFormValues = z.infer<typeof qrcodeFormSchema>;

// Mock AddressSearch component
jest.mock('@/components/address-search', () => ({
  AddressSearch: ({ onSelect }: { onSelect: (data: { address: string }) => void }) => (
    <button
      data-testid="address-search-button"
      onClick={() => onSelect({ address: '서울특별시 강남구 테헤란로 123' })}
    >
      주소검색
    </button>
  ),
}));

// Test wrapper component that provides form context
function CardVCardWrapper({ defaultValues }: { defaultValues?: Partial<QrcodeFormValues> }) {
  const methods = useForm<QrcodeFormValues>({
    resolver: zodResolver(qrcodeFormSchema),
    defaultValues: {
      qrType: 'vcard',
      vcardFullName: '',
      vcardPhoneNumber: '',
      vcardEmail: '',
      vcardOrganization: '',
      vcardJobTitle: '',
      vcardWebsite: '',
      vcardAddress: '',
      ...defaultValues,
    },
  });

  return (
    <FormProvider {...methods}>
      <CardVCard />
    </FormProvider>
  );
}

describe('CardVCard', () => {
  describe('렌더링', () => {
    it('연락처 정보 카드가 올바른 제목과 설명으로 렌더링되어야 함', () => {
      render(<CardVCardWrapper />);
      
      expect(screen.getByText('연락처 정보')).toBeInTheDocument();
      expect(screen.getByText('명함 정보를 입력하세요. 이름, 전화번호, 이메일 중 하나는 필수입니다.')).toBeInTheDocument();
    });

    it('모든 vCard 필드가 렌더링되어야 함', () => {
      render(<CardVCardWrapper />);
      
      // 이름 (필수)
      expect(screen.getByText('이름')).toBeInTheDocument();
      expect(screen.getByText('(필수)')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('홍길동')).toBeInTheDocument();
      
      // 전화번호 (선택)
      expect(screen.getByText('전화번호')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('010-1234-5678')).toBeInTheDocument();
      
      // 이메일 (선택)
      expect(screen.getByText('이메일')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('example@domain.com')).toBeInTheDocument();
      
      // 회사/조직 (선택)
      expect(screen.getByText('회사/조직')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('회사명')).toBeInTheDocument();
      
      // 직함 (선택)
      expect(screen.getByText('직함')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('직책/직위')).toBeInTheDocument();
      
      // 웹사이트 (선택)
      expect(screen.getByText('웹사이트')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('https://example.com')).toBeInTheDocument();
      
      // 주소 (선택)
      expect(screen.getByText('주소')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('서울특별시 강남구 테헤란로 123')).toBeInTheDocument();
    });

    it('적절한 입력 타입이 설정되어야 함', () => {
      render(<CardVCardWrapper />);
      
      const phoneInput = screen.getByPlaceholderText('010-1234-5678');
      const emailInput = screen.getByPlaceholderText('example@domain.com');
      const websiteInput = screen.getByPlaceholderText('https://example.com');
      
      expect(phoneInput).toHaveAttribute('type', 'tel');
      expect(emailInput).toHaveAttribute('type', 'email');
      expect(websiteInput).toHaveAttribute('type', 'url');
    });

    it('주소 검색 버튼이 렌더링되어야 함', () => {
      render(<CardVCardWrapper />);
      
      expect(screen.getByTestId('address-search-button')).toBeInTheDocument();
    });

    it('선택 필드 표시가 올바르게 되어야 함', () => {
      render(<CardVCardWrapper />);
      
      // 이름은 필수, 나머지는 선택
      expect(screen.getByText('(필수)')).toBeInTheDocument();
      expect(screen.getAllByText('(선택)')).toHaveLength(6); // 전화번호, 이메일, 회사, 직함, 웹사이트, 주소
    });
  });

  describe('사용자 입력', () => {
    it('이름 입력이 정상적으로 동작해야 함', () => {
      render(<CardVCardWrapper />);
      
      const nameInput = screen.getByPlaceholderText('홍길동');
      fireEvent.change(nameInput, { target: { value: '김철수' } });
      
      expect(nameInput).toHaveValue('김철수');
    });

    it('전화번호 입력이 정상적으로 동작해야 함', () => {
      render(<CardVCardWrapper />);
      
      const phoneInput = screen.getByPlaceholderText('010-1234-5678');
      fireEvent.change(phoneInput, { target: { value: '02-123-4567' } });
      
      expect(phoneInput).toHaveValue('02-123-4567');
    });

    it('이메일 입력이 정상적으로 동작해야 함', () => {
      render(<CardVCardWrapper />);
      
      const emailInput = screen.getByPlaceholderText('example@domain.com');
      fireEvent.change(emailInput, { target: { value: 'user@company.com' } });
      
      expect(emailInput).toHaveValue('user@company.com');
    });

    it('회사/조직 입력이 정상적으로 동작해야 함', () => {
      render(<CardVCardWrapper />);
      
      const organizationInput = screen.getByPlaceholderText('회사명');
      fireEvent.change(organizationInput, { target: { value: 'ABC 주식회사' } });
      
      expect(organizationInput).toHaveValue('ABC 주식회사');
    });

    it('직함 입력이 정상적으로 동작해야 함', () => {
      render(<CardVCardWrapper />);
      
      const jobTitleInput = screen.getByPlaceholderText('직책/직위');
      fireEvent.change(jobTitleInput, { target: { value: '선임 개발자' } });
      
      expect(jobTitleInput).toHaveValue('선임 개발자');
    });

    it('웹사이트 입력이 정상적으로 동작해야 함', () => {
      render(<CardVCardWrapper />);
      
      const websiteInput = screen.getByPlaceholderText('https://example.com');
      fireEvent.change(websiteInput, { target: { value: 'https://mycompany.com' } });
      
      expect(websiteInput).toHaveValue('https://mycompany.com');
    });

    it('주소 입력이 정상적으로 동작해야 함', () => {
      render(<CardVCardWrapper />);
      
      const addressInput = screen.getByPlaceholderText('서울특별시 강남구 테헤란로 123');
      fireEvent.change(addressInput, { target: { value: '부산광역시 해운대구 해운대로 123' } });
      
      expect(addressInput).toHaveValue('부산광역시 해운대구 해운대로 123');
    });

    it('주소 검색 버튼이 정상적으로 동작해야 함', () => {
      render(<CardVCardWrapper />);
      
      const addressInput = screen.getByPlaceholderText('서울특별시 강남구 테헤란로 123');
      const searchButton = screen.getByTestId('address-search-button');
      
      fireEvent.click(searchButton);
      
      expect(addressInput).toHaveValue('서울특별시 강남구 테헤란로 123');
    });
  });

  describe('기본값', () => {
    it('기본값이 설정되어 있으면 모든 필드에 표시되어야 함', () => {
      const defaultValues = {
        vcardFullName: '이영희',
        vcardPhoneNumber: '010-9999-8888',
        vcardEmail: 'lee@company.com',
        vcardOrganization: 'XYZ Corporation',
        vcardJobTitle: '프로젝트 매니저',
        vcardWebsite: 'https://xyz-corp.com',
        vcardAddress: '인천광역시 연수구 송도대로 123',
      };
      
      render(<CardVCardWrapper defaultValues={defaultValues} />);
      
      expect(screen.getByDisplayValue('이영희')).toBeInTheDocument();
      expect(screen.getByDisplayValue('010-9999-8888')).toBeInTheDocument();
      expect(screen.getByDisplayValue('lee@company.com')).toBeInTheDocument();
      expect(screen.getByDisplayValue('XYZ Corporation')).toBeInTheDocument();
      expect(screen.getByDisplayValue('프로젝트 매니저')).toBeInTheDocument();
      expect(screen.getByDisplayValue('https://xyz-corp.com')).toBeInTheDocument();
      expect(screen.getByDisplayValue('인천광역시 연수구 송도대로 123')).toBeInTheDocument();
    });

    it('빈 기본값으로 초기화되어야 함', () => {
      render(<CardVCardWrapper />);
      
      const inputs = [
        screen.getByPlaceholderText('홍길동'),
        screen.getByPlaceholderText('010-1234-5678'),
        screen.getByPlaceholderText('example@domain.com'),
        screen.getByPlaceholderText('회사명'),
        screen.getByPlaceholderText('직책/직위'),
        screen.getByPlaceholderText('https://example.com'),
        screen.getByPlaceholderText('서울특별시 강남구 테헤란로 123'),
      ];
      
      inputs.forEach(input => {
        expect(input).toHaveValue('');
      });
    });
  });

  describe('레이아웃', () => {
    it('필드들이 그리드 레이아웃으로 배치되어야 함', () => {
      const { container } = render(<CardVCardWrapper />);
      
      const gridContainer = container.querySelector('.grid.grid-cols-1.md\\:grid-cols-2');
      expect(gridContainer).toBeInTheDocument();
    });

    it('웹사이트와 주소 필드가 전체 너비를 차지해야 함', () => {
      render(<CardVCardWrapper />);
      
      const websiteInput = screen.getByPlaceholderText('https://example.com');
      const addressInput = screen.getByPlaceholderText('서울특별시 강남구 테헤란로 123');
      
      expect(websiteInput.closest('.col-span-1.md\\:col-span-2')).toBeInTheDocument();
      expect(addressInput.closest('.col-span-1.md\\:col-span-2')).toBeInTheDocument();
    });
  });

  describe('접근성', () => {
    it('모든 입력 필드가 적절한 라벨을 가져야 함', () => {
      render(<CardVCardWrapper />);
      
      const nameInput = screen.getByPlaceholderText('홍길동');
      const phoneInput = screen.getByPlaceholderText('010-1234-5678');
      const emailInput = screen.getByPlaceholderText('example@domain.com');
      const organizationInput = screen.getByPlaceholderText('회사명');
      const jobTitleInput = screen.getByPlaceholderText('직책/직위');
      const websiteInput = screen.getByPlaceholderText('https://example.com');
      const addressInput = screen.getByPlaceholderText('서울특별시 강남구 테헤란로 123');
      
      expect(nameInput).toHaveAccessibleName(/이름/);
      expect(phoneInput).toHaveAccessibleName(/전화번호/);
      expect(emailInput).toHaveAccessibleName(/이메일/);
      expect(organizationInput).toHaveAccessibleName(/회사\/조직/);
      expect(jobTitleInput).toHaveAccessibleName(/직함/);
      expect(websiteInput).toHaveAccessibleName(/웹사이트/);
      expect(addressInput).toHaveAccessibleName(/주소/);
    });

    it('주소 필드에 도움말이 표시되어야 함', () => {
      render(<CardVCardWrapper />);
      
      expect(
        screen.getByText(
          '정확한 주소나 장소명을 입력하거나 검색 버튼을 클릭하여 다음 우편번호 서비스로 주소를 찾으세요.'
        )
      ).toBeInTheDocument();
    });
  });

  describe('통합 테스트', () => {
    it('완전한 명함 정보를 입력할 수 있어야 함', () => {
      render(<CardVCardWrapper />);
      
      const nameInput = screen.getByPlaceholderText('홍길동');
      const phoneInput = screen.getByPlaceholderText('010-1234-5678');
      const emailInput = screen.getByPlaceholderText('example@domain.com');
      const organizationInput = screen.getByPlaceholderText('회사명');
      const jobTitleInput = screen.getByPlaceholderText('직책/직위');
      const websiteInput = screen.getByPlaceholderText('https://example.com');
      const addressInput = screen.getByPlaceholderText('서울특별시 강남구 테헤란로 123');
      
      fireEvent.change(nameInput, { target: { value: '김개발' } });
      fireEvent.change(phoneInput, { target: { value: '010-1111-2222' } });
      fireEvent.change(emailInput, { target: { value: 'kim.dev@tech.com' } });
      fireEvent.change(organizationInput, { target: { value: '테크컴퍼니' } });
      fireEvent.change(jobTitleInput, { target: { value: '시니어 풀스택 개발자' } });
      fireEvent.change(websiteInput, { target: { value: 'https://kimdev.tech' } });
      fireEvent.change(addressInput, { target: { value: '서울특별시 강남구 역삼동 123-45' } });
      
      expect(nameInput).toHaveValue('김개발');
      expect(phoneInput).toHaveValue('010-1111-2222');
      expect(emailInput).toHaveValue('kim.dev@tech.com');
      expect(organizationInput).toHaveValue('테크컴퍼니');
      expect(jobTitleInput).toHaveValue('시니어 풀스택 개발자');
      expect(websiteInput).toHaveValue('https://kimdev.tech');
      expect(addressInput).toHaveValue('서울특별시 강남구 역삼동 123-45');
    });
  });
});
