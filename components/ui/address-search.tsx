"use client";

import { useState } from "react";
import DaumPostcode, { Address } from "react-daum-postcode";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Search } from "lucide-react";

interface AddressSearchProps {
  onAddressSelect: (address: string) => void;
  children?: React.ReactNode;
}

export function AddressSearch({ onAddressSelect, children }: AddressSearchProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleComplete = (data: Address) => {
    // 도로명 주소를 우선으로 사용, 없으면 지번 주소 사용
    const fullAddress = data.roadAddress || data.jibunAddress;

    // 건물명이 있으면 포함
    let completeAddress = fullAddress;
    if (data.buildingName) {
      completeAddress += ` (${data.buildingName})`;
    }

    onAddressSelect(completeAddress);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children ? (
          <div onClick={() => setIsOpen(true)}>
            {children}
          </div>
        ) : (
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsOpen(true)}
            className="w-full"
          >
            <Search className="h-4 w-4 mr-2" />
            주소 검색
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md max-h-[80vh] p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle>주소 검색</DialogTitle>
        </DialogHeader>
        <div className="p-6 pt-4">
          <div className="min-h-[400px] w-full">
            <DaumPostcode
              onComplete={handleComplete}
              style={{
                width: "100%",
                height: "400px",
              }}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
