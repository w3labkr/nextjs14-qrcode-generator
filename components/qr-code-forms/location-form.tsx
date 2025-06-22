"use client";

import { useState, useEffect } from "react";
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
import { MapPin, Search } from "lucide-react";

interface LocationFormProps {
  onChange: (locationString: string) => void;
  initialValue?: string;
}

export function LocationForm({ onChange, initialValue }: LocationFormProps) {
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [address, setAddress] = useState("");

  // 위치 문자열에서 개별 필드로 파싱하는 함수
  const parseLocationString = (locationStr: string) => {
    if (locationStr.startsWith("geo:")) {
      // geo:37.7749,-122.4194
      const coords = locationStr.substring(4).split(",");
      return {
        latitude: coords[0] || "",
        longitude: coords[1] || "",
        address: "",
      };
    } else if (locationStr.includes("maps.google.com")) {
      // Google Maps URL
      const url = new URL(locationStr);
      const q = url.searchParams.get("q");
      return {
        latitude: "",
        longitude: "",
        address: q ? decodeURIComponent(q) : "",
      };
    }
    return null;
  };

  // 초기값 설정
  useEffect(() => {
    if (initialValue) {
      const parsed = parseLocationString(initialValue);
      if (parsed) {
        setLatitude(parsed.latitude);
        setLongitude(parsed.longitude);
        setAddress(parsed.address);
      }
    }
  }, [initialValue]);

  const generateLocationString = () => {
    if (latitude && longitude) {
      // 좌표 기반 위치
      const locationString = `geo:${latitude},${longitude}`;
      onChange(locationString);
    } else if (address) {
      // 주소 기반 구글 지도 링크
      const encodedAddress = encodeURIComponent(address);
      const mapsUrl = `https://maps.google.com/?q=${encodedAddress}`;
      onChange(mapsUrl);
    } else {
      onChange("");
    }
  };

  useEffect(() => {
    generateLocationString();
  }, [latitude, longitude, address]);

  const [isGettingLocation, setIsGettingLocation] = useState(false);

  const getCurrentLocation = () => {
    if ("geolocation" in navigator) {
      setIsGettingLocation(true);

      // 먼저 빠른 위치 정보 시도 (캐시된 위치 또는 네트워크 기반)
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLatitude(position.coords.latitude.toString());
          setLongitude(position.coords.longitude.toString());
          setAddress(""); // 좌표가 설정되면 주소는 비움
          setIsGettingLocation(false);
        },
        (error) => {
          console.warn(
            "빠른 위치 정보 가져오기 실패, 정확한 위치 정보 시도 중...",
            error,
          );

          // 첫 번째 시도가 실패하면 더 관대한 옵션으로 재시도
          navigator.geolocation.getCurrentPosition(
            (position) => {
              setLatitude(position.coords.latitude.toString());
              setLongitude(position.coords.longitude.toString());
              setAddress(""); // 좌표가 설정되면 주소는 비움
              setIsGettingLocation(false);
            },
            (secondError) => {
              console.error("위치 정보를 가져올 수 없습니다:", secondError);
              let errorMessage = "위치 정보를 가져올 수 없습니다.";

              switch (secondError.code) {
                case secondError.PERMISSION_DENIED:
                  errorMessage =
                    "위치 접근 권한이 거부되었습니다. 브라우저 설정에서 위치 권한을 허용해주세요.";
                  break;
                case secondError.POSITION_UNAVAILABLE:
                  errorMessage =
                    "위치 정보를 사용할 수 없습니다. 네트워크 연결을 확인해주세요.";
                  break;
                case secondError.TIMEOUT:
                  errorMessage =
                    "위치 정보 요청 시간이 초과되었습니다. 실외에서 다시 시도해보거나 수동으로 좌표를 입력해주세요.";
                  break;
              }

              alert(errorMessage);
              setIsGettingLocation(false);
            },
            {
              enableHighAccuracy: false, // 정확도보다 속도 우선
              timeout: 10000, // 10초로 단축
              maximumAge: 300000, // 5분간 캐시된 위치 사용
            },
          );
        },
        {
          enableHighAccuracy: true, // 첫 번째 시도는 높은 정확도
          timeout: 5000, // 5초로 단축
          maximumAge: 60000, // 1분간 캐시된 위치 사용
        },
      );
    } else {
      alert("이 브라우저는 위치 서비스를 지원하지 않습니다.");
    }
  };

  const handleCoordinateChange = (lat: string, lng: string) => {
    setLatitude(lat);
    setLongitude(lng);
    if (lat || lng) {
      setAddress(""); // 좌표가 입력되면 주소는 비움
    }
  };

  const handleAddressChange = (addr: string) => {
    setAddress(addr);
    if (addr) {
      setLatitude(""); // 주소가 입력되면 좌표는 비움
      setLongitude("");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>위치/지도</CardTitle>
        <CardDescription>
          GPS 좌표나 주소를 입력하여 지도 앱을 실행하는 QR 코드를 생성하세요.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* GPS 좌표 입력 */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            <Label className="text-sm font-medium">GPS 좌표</Label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="latitude">위도 (Latitude)</Label>
              <Input
                id="latitude"
                type="number"
                step="any"
                value={latitude}
                onChange={(e) =>
                  handleCoordinateChange(e.target.value, longitude)
                }
                placeholder="37.5665"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="longitude">경도 (Longitude)</Label>
              <Input
                id="longitude"
                type="number"
                step="any"
                value={longitude}
                onChange={(e) =>
                  handleCoordinateChange(latitude, e.target.value)
                }
                placeholder="126.9780"
              />
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={getCurrentLocation}
            disabled={isGettingLocation}
            className="w-full"
          >
            <MapPin className="h-4 w-4 mr-2" />
            {isGettingLocation
              ? "위치 정보 가져오는 중..."
              : "현재 위치 가져오기"}
          </Button>
        </div>

        {/* 구분선 */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              또는
            </span>
          </div>
        </div>

        {/* 주소 입력 */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            <Label className="text-sm font-medium">주소 검색</Label>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="address">주소</Label>
            <Input
              id="address"
              value={address}
              onChange={(e) => handleAddressChange(e.target.value)}
              placeholder="서울특별시 중구 세종대로 110"
            />
            <p className="text-xs text-muted-foreground">
              정확한 주소나 장소명을 입력하면 Google 지도에서 검색됩니다.
            </p>
          </div>
        </div>

        {/* 미리보기 */}
        {latitude && longitude && (
          <div className="p-3 bg-green-50 rounded-lg border border-green-200">
            <p className="text-sm text-green-700">
              <strong>GPS 좌표:</strong> {latitude}, {longitude}
            </p>
            <p className="text-xs text-green-600 mt-1">
              QR 코드를 스캔하면 지도 앱에서 이 위치가 표시됩니다.
            </p>
          </div>
        )}

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
