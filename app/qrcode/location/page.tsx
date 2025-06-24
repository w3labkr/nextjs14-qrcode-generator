"use client";

export const dynamic = "force-dynamic";

import { useMemo, useEffect } from "react";
import { debounce } from "lodash";

import { QrCodePageLayout } from "@/components/qr-code-page-layout";
import { QrCodeTypeNavigation } from "@/components/qr-code-type-navigation";
import { LocationForm } from "@/app/qrcode/location/location-form";
import { useQrCodeGenerator } from "@/hooks/use-qr-code-generator";
import { useQrFormStore } from "@/hooks/use-qr-form-store";

export default function LocationQrCodePage() {
  const { setQrData, setActiveTab } = useQrCodeGenerator();
  const { getQrContent, setActiveTab: setStoreActiveTab } = useQrFormStore();

  // QR 데이터 변경을 debounce 처리
  const debouncedSetQrData = useMemo(
    () => debounce(setQrData, 200),
    [setQrData],
  );

  // 컴포넌트 마운트 시 활성 탭 설정
  useEffect(() => {
    setActiveTab("location");
    setStoreActiveTab("location");
  }, [setActiveTab, setStoreActiveTab]);

  // 각 폼에서 데이터가 변경될 때 QR 데이터 업데이트
  const handleFormDataChange = () => {
    const content = getQrContent();
    debouncedSetQrData(content);
  };

  return (
    <QrCodePageLayout
      title="지도 QR 코드 생성기"
      description="위치 정보를 QR 코드로 변환하여 쉽게 공유하세요."
      qrType="location"
    >
      <QrCodeTypeNavigation />
      <LocationForm onChange={handleFormDataChange} />
    </QrCodePageLayout>
  );
}
