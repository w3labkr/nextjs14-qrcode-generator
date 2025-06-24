"use client";

import { useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UrlForm } from "@/components/qr-code-forms/url-form";
import { TextForm } from "@/components/qr-code-forms/text-form";
import { WifiForm } from "@/components/qr-code-forms/wifi-form";
import { EmailForm } from "@/components/qr-code-forms/email-form";
import { SmsForm } from "@/components/qr-code-forms/sms-form";
import { VCardForm } from "@/components/qr-code-forms/vcard-form";
import { LocationForm } from "@/components/qr-code-forms/location-form";
import { useQrFormStore } from "@/hooks/use-qr-form-store";

interface QrCodeTabsProps {
  qrData: string;
  setQrData: (data: string) => void;
  activeTab: string;
  onTabChange: (value: string) => void;
}

export function QrCodeTabs({
  qrData,
  setQrData,
  activeTab,
  onTabChange,
}: QrCodeTabsProps) {
  const { getQrContent, setActiveTab } = useQrFormStore();

  // 탭이 변경될 때마다 해당 탭의 QR 데이터를 업데이트
  useEffect(() => {
    setActiveTab(activeTab);
    const content = getQrContent();
    if (content && content !== qrData) {
      setQrData(content);
    }
  }, [activeTab, setActiveTab, getQrContent, qrData, setQrData]);

  // 각 폼에서 데이터가 변경될 때 QR 데이터 업데이트
  const handleFormDataChange = () => {
    const content = getQrContent();
    setQrData(content);
  };
  return (
    <Tabs value={activeTab} className="w-full" onValueChange={onTabChange}>
      <div className="w-full overflow-x-auto">
        <TabsList className="inline-flex w-max min-w-full justify-start gap-1 h-auto p-1">
          <TabsTrigger
            value="url"
            className="flex-shrink-0 px-2 py-1.5 text-xs sm:px-3 sm:py-2 sm:text-sm"
          >
            URL
          </TabsTrigger>
          <TabsTrigger
            value="text"
            className="flex-shrink-0 px-2 py-1.5 text-xs sm:px-3 sm:py-2 sm:text-sm"
          >
            텍스트
          </TabsTrigger>
          <TabsTrigger
            value="wifi"
            className="flex-shrink-0 px-2 py-1.5 text-xs sm:px-3 sm:py-2 sm:text-sm"
          >
            Wi-Fi
          </TabsTrigger>
          <TabsTrigger
            value="email"
            className="flex-shrink-0 px-2 py-1.5 text-xs sm:px-3 sm:py-2 sm:text-sm"
          >
            이메일
          </TabsTrigger>
          <TabsTrigger
            value="sms"
            className="flex-shrink-0 px-2 py-1.5 text-xs sm:px-3 sm:py-2 sm:text-sm"
          >
            SMS
          </TabsTrigger>
          <TabsTrigger
            value="vcard"
            className="flex-shrink-0 px-2 py-1.5 text-xs sm:px-3 sm:py-2 sm:text-sm"
          >
            연락처
          </TabsTrigger>
          <TabsTrigger
            value="location"
            className="flex-shrink-0 px-2 py-1.5 text-xs sm:px-3 sm:py-2 sm:text-sm"
          >
            지도
          </TabsTrigger>
        </TabsList>
      </div>
      <TabsContent value="url">
        <UrlForm value="" onChange={handleFormDataChange} />
      </TabsContent>
      <TabsContent value="text">
        <TextForm value="" onChange={handleFormDataChange} />
      </TabsContent>
      <TabsContent value="wifi">
        <WifiForm onWifiDataChange={handleFormDataChange} />
      </TabsContent>
      <TabsContent value="email">
        <EmailForm onChange={handleFormDataChange} />
      </TabsContent>
      <TabsContent value="sms">
        <SmsForm onChange={handleFormDataChange} />
      </TabsContent>
      <TabsContent value="vcard">
        <VCardForm onChange={handleFormDataChange} />
      </TabsContent>
      <TabsContent value="location">
        <LocationForm onChange={handleFormDataChange} />
      </TabsContent>
    </Tabs>
  );
}
