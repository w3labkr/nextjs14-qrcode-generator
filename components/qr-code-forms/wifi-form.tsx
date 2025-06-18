"use client";

import { useState, useEffect } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  escapeWifiString,
  validateWifiQrString,
  diagnoseWifiQrIssues,
} from "@/lib/wifi-qr-validator";

interface WifiFormProps {
  onWifiDataChange: (data: string) => void;
}

export function WifiForm({ onWifiDataChange }: WifiFormProps) {
  const [ssid, setSsid] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [encryption, setEncryption] = useState("WPA");
  const [isHidden, setIsHidden] = useState(false);
  const [wifiString, setWifiString] = useState("");
  const [validationResult, setValidationResult] = useState<{
    isValid: boolean;
    errors: string[];
  }>({ isValid: true, errors: [] });

  const generateWifiString = () => {
    if (!ssid.trim()) {
      setWifiString("");
      onWifiDataChange("");
      return;
    }

    const escapedSsid = escapeWifiString(ssid);
    const escapedPassword = escapeWifiString(password);
    const hiddenFlag = isHidden ? "true" : "false";

    const newWifiString = `WIFI:T:${encryption};S:${escapedSsid};P:${escapedPassword};H:${hiddenFlag};;`;
    setWifiString(newWifiString);

    // 검증 수행
    const validation = validateWifiQrString(newWifiString);
    const issues = diagnoseWifiQrIssues(newWifiString);

    setValidationResult({
      isValid: validation.isValid && issues.length === 0,
      errors: [...validation.errors, ...issues],
    });

    onWifiDataChange(newWifiString);
  };

  // 모든 값이 변경될 때마다 자동으로 WiFi 문자열 생성
  useEffect(() => {
    generateWifiString();
  }, [ssid, password, encryption, isHidden]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Wi-Fi 네트워크</CardTitle>
        <CardDescription>
          네트워크 정보를 입력하여 Wi-Fi 접속 QR 코드를 생성하세요.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-1 gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="ssid">네트워크 이름 (SSID)</Label>
          <Input
            id="ssid"
            value={ssid}
            onChange={(e) => setSsid(e.target.value)}
            placeholder="WiFi 네트워크 이름을 입력하세요"
            required
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="password">비밀번호</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="WiFi 비밀번호를 입력하세요"
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground"
              aria-label={showPassword ? "비밀번호 숨기기" : "비밀번호 보기"}
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="encryption">암호화 방식</Label>
          <Select
            value={encryption}
            onValueChange={(value) => setEncryption(value)}
          >
            <SelectTrigger id="encryption">
              <SelectValue placeholder="암호화 방식 선택" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="WPA">WPA/WPA2/WPA3</SelectItem>
              <SelectItem value="WEP">WEP (권장하지 않음)</SelectItem>
              <SelectItem value="nopass">암호화 없음</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2 pt-6">
          <input
            type="checkbox"
            id="isHidden"
            checked={isHidden}
            onChange={(e) => setIsHidden(e.target.checked)}
            className="h-4 w-4"
          />
          <Label htmlFor="isHidden">숨겨진 네트워크</Label>
        </div>

        {/* 검증 결과 표시 */}
        {ssid && !validationResult.isValid && (
          <div className="col-span-full">
            <Alert>
              <AlertDescription>
                <strong>WiFi QR 코드 문제가 발견되었습니다:</strong>
                <ul className="list-disc list-inside mt-2">
                  {validationResult.errors.map((error, index) => (
                    <li key={index} className="text-sm">
                      {error}
                    </li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          </div>
        )}

        {/* 디버깅을 위한 생성된 WiFi 문자열 표시 */}
        {ssid && (
          <div className="col-span-full">
            <Label>생성된 WiFi QR 코드 데이터</Label>
            <div className="mt-1 p-2 bg-gray-100 rounded text-sm font-mono break-all">
              {wifiString}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              이 문자열이 QR 코드로 변환됩니다. 특수 문자가 자동으로 이스케이프
              처리됩니다.
              {validationResult.isValid && " ✅ 유효한 WiFi QR 코드입니다."}
            </p>
          </div>
        )}

        {/* WiFi QR 코드 사용 가이드 */}
        {ssid && validationResult.isValid && (
          <div className="col-span-full">
            <Alert>
              <AlertDescription>
                <strong>WiFi QR 코드 연결 가이드:</strong>
                <ol className="list-decimal list-inside mt-2 space-y-1 text-sm">
                  <li>
                    스마트폰 카메라 앱을 열거나 QR 코드 스캐너를 사용하세요
                  </li>
                  <li>QR 코드를 스캔하면 WiFi 연결 알림이 나타납니다</li>
                  <li>알림을 탭하여 자동으로 WiFi에 연결하세요</li>
                  <li>
                    연결이 되지 않으면 WiFi 설정에서 수동으로 확인해보세요
                  </li>
                </ol>
                <p className="text-xs text-gray-600 mt-2">
                  일부 구형 기기는 WiFi QR 코드를 지원하지 않을 수 있습니다.
                </p>
              </AlertDescription>
            </Alert>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
