"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import DaumPostcode from "react-daum-postcode";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export interface AddressData {
  address: string;
  jibunAddress: string;
  zonecode: string;
}

interface AddressSearchProps {
  onSelect: (data: AddressData) => void;
  disabled?: boolean;
  children?: React.ReactNode;
}

export function AddressSearch({
  onSelect,
  disabled = false,
  children,
}: AddressSearchProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleComplete = (data: any) => {
    const addressData: AddressData = {
      address: data.address,
      jibunAddress: data.jibunAddress,
      zonecode: data.zonecode,
    };

    onSelect(addressData);
    setIsOpen(false);
  };

  const handleOpenDialog = () => {
    if (!disabled) {
      setIsOpen(true);
    }
  };

  return (
    <>
      {children ? (
        <div
          onClick={handleOpenDialog}
          style={{ cursor: disabled ? "not-allowed" : "pointer" }}
        >
          {children}
        </div>
      ) : (
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={handleOpenDialog}
          disabled={disabled}
        >
          <Search className="h-4 w-4" />
        </Button>
      )}

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>주소 검색</DialogTitle>
            <DialogDescription>검색할 주소를 입력하세요.</DialogDescription>
          </DialogHeader>
          <div className="h-96">
            <DaumPostcode
              onComplete={handleComplete}
              autoClose={false}
              style={{
                width: "100%",
                height: "100%",
              }}
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

interface AddressSearchButtonProps {
  onSelect: (data: AddressData) => void;
  disabled?: boolean;
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  children?: React.ReactNode;
}

export function AddressSearchButton({
  onSelect,
  disabled = false,
  variant = "outline",
  size = "icon",
  className,
  children,
}: AddressSearchButtonProps) {
  return (
    <AddressSearch onSelect={onSelect} disabled={disabled}>
      <Button
        type="button"
        variant={variant}
        size={size}
        className={className}
        disabled={disabled}
      >
        {children || <Search className="h-4 w-4" />}
      </Button>
    </AddressSearch>
  );
}
