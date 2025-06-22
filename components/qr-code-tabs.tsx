"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UrlForm } from "@/components/qr-code-forms/url-form";
import { TextForm } from "@/components/qr-code-forms/text-form";
import { WifiForm } from "@/components/qr-code-forms/wifi-form";
import { EmailForm } from "@/components/qr-code-forms/email-form";
import { SmsForm } from "@/components/qr-code-forms/sms-form";
import { VCardForm } from "@/components/qr-code-forms/vcard-form";
import { LocationForm } from "@/components/qr-code-forms/location-form";

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
  return (
    <Tabs value={activeTab} className="w-full" onValueChange={onTabChange}>
      <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-1">
        <TabsTrigger value="url">URL</TabsTrigger>
        <TabsTrigger value="text">텍스트</TabsTrigger>
        <TabsTrigger value="wifi">Wi-Fi</TabsTrigger>
        <TabsTrigger value="email">이메일</TabsTrigger>
        <TabsTrigger value="sms">SMS</TabsTrigger>
        <TabsTrigger value="vcard">연락처</TabsTrigger>
        <TabsTrigger value="location">위치</TabsTrigger>
      </TabsList>
      <TabsContent value="url">
        <UrlForm value={qrData} onChange={setQrData} />
      </TabsContent>
      <TabsContent value="text">
        <TextForm value={qrData} onChange={setQrData} />
      </TabsContent>
      <TabsContent value="wifi">
        <WifiForm onWifiDataChange={setQrData} initialValue={qrData} />
      </TabsContent>
      <TabsContent value="email">
        <EmailForm onChange={setQrData} initialValue={qrData} />
      </TabsContent>
      <TabsContent value="sms">
        <SmsForm onChange={setQrData} initialValue={qrData} />
      </TabsContent>
      <TabsContent value="vcard">
        <VCardForm onChange={setQrData} initialValue={qrData} />
      </TabsContent>
      <TabsContent value="location">
        <LocationForm onChange={setQrData} initialValue={qrData} />
      </TabsContent>
    </Tabs>
  );
}
