'''"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface WifiFormProps {
  onWifiDataChange: (data: string) => void;
}

export function WifiForm({ onWifiDataChange }: WifiFormProps) {
  const [ssid, setSsid] = useState("");
  const [password, setPassword] = useState("");
  const [encryption, setEncryption] = useState("WPA");
  const [isHidden, setIsHidden] = useState(false);

  const generateWifiString = () => {
    const wifiString = `WIFI:T:${encryption};S:${ssid};P:${password};H:${isHidden};`;
    onWifiDataChange(wifiString);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Wi-Fi 네트워크</CardTitle>
        <CardDescription>
          네트워크 정보를 입력하여 Wi-Fi 접속 QR 코드를 생성하세요.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="ssid">네트워크 이름 (SSID)</Label>
          <Input
            id="ssid"
            value={ssid}
            onChange={(e) => {
              setSsid(e.target.value);
              generateWifiString();
            }}
            required
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="password">비밀번호</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              generateWifiString();
            }}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="encryption">암호화 방식</Label>
          <Select
            value={encryption}
            onValueChange={(value) => {
              setEncryption(value);
              generateWifiString();
            }}
          >
            <SelectTrigger id="encryption">
              <SelectValue placeholder="암호화 방식 선택" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="WPA">WPA/WPA2</SelectItem>
              <SelectItem value="WEP">WEP</SelectItem>
              <SelectItem value="nopass">없음</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2 pt-6">
          <input
            type="checkbox"
            id="isHidden"
            checked={isHidden}
            onChange={(e) => {
              setIsHidden(e.target.checked);
              generateWifiString();
            }}
            className="h-4 w-4"
          />
          <Label htmlFor="isHidden">숨겨진 네트워크</Label>
        </div>
      </CardContent>
    </Card>
  );
}''
