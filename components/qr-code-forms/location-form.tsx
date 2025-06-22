"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AddressSearch } from "@/components/ui/address-search";
import { Search } from "lucide-react";

interface LocationFormProps {
  onChange: (locationString: string) => void;
  initialValue?: string;
}

export function LocationForm({ onChange, initialValue }: LocationFormProps) {
  const [address, setAddress] = useState("");
  const onChangeRef = useRef(onChange);

  // onChange 함수의 최신 참조를 유지
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    if (initialValue && !address) {
      if (initialValue.includes("maps.google.com")) {
        try {
          const url = new URL(initialValue);
          const q = url.searchParams.get("q");
          if (q && decodeURIComponent(q) !== address) {
            setAddress(decodeURIComponent(q));
          }
        } catch {
          // URL 파싱 실패 시 무시
        }
      }
    }
  }, [initialValue, address]);

  useEffect(() => {
    if (address) {
      const encodedAddress = encodeURIComponent(address);
      const mapsUrl = `https://maps.google.com/?q=${encodedAddress}`;
      onChangeRef.current(mapsUrl);
    } else {
      onChangeRef.current("");
    }
  }, [address]);

  const handleAddressChange = useCallback((addr: string) => {
    setAddress(addr);
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>지도</CardTitle>
        <CardDescription>
          주소를 입력하여 지도 앱을 실행하는 QR 코드를 생성하세요.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="address">주소</Label>
            <div className="flex gap-2">
              <Input
                id="address"
                value={address}
                onChange={(e) => handleAddressChange(e.target.value)}
                placeholder="서울특별시 중구 세종대로 110"
                className="flex-1"
              />
              <AddressSearch onAddressSelect={handleAddressChange}>
                <Button type="button" variant="outline" size="icon">
                  <Search className="h-4 w-4" />
                </Button>
              </AddressSearch>
            </div>
            <p className="text-xs text-muted-foreground">
              정확한 주소나 장소명을 입력하거나 검색 버튼을 클릭하여 다음
              우편번호 서비스로 주소를 찾으세요.
            </p>
          </div>
        </div>

        {address && (
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-700">
              <strong>주소:</strong> {address}
            </p>
            <p className="text-xs text-blue-600 mt-1">
              QR 코드를 스캔하면 Google 지도에서 이 주소를 검색합니다.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
