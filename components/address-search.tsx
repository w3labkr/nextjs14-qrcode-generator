"use client";

import { useDaumPostcodePopup, Address } from "react-daum-postcode";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

interface AddressSearchProps {
  onAddressSelect: (address: string) => void;
  children?: React.ReactNode;
}

export function AddressSearch({
  onAddressSelect,
  children,
}: AddressSearchProps) {
  const openPostcode = useDaumPostcodePopup();

  const handleComplete = (data: Address) => {
    // 도로명 주소를 우선으로 사용, 없으면 지번 주소 사용
    const fullAddress = data.roadAddress || data.jibunAddress;

    // 건물명이 있으면 포함
    let completeAddress = fullAddress;
    if (data.buildingName) {
      completeAddress += ` (${data.buildingName})`;
    }

    onAddressSelect(completeAddress);
  };

  // 팝업 모드로 주소 검색 실행
  return children ? (
    <div onClick={() => openPostcode({ onComplete: handleComplete })}>
      {children}
    </div>
  ) : (
    <Button
      type="button"
      variant="outline"
      onClick={() => openPostcode({ onComplete: handleComplete })}
      className="w-full"
    >
      <Search className="h-4 w-4" />
      주소 검색
    </Button>
  );
}
