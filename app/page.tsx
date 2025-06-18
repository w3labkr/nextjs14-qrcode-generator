"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { generateQrCode } from "@/app/actions/qr-code";
import Image from "next/image";

export default function HomePage() {
  const [text, setText] = useState("");
  const [qrCode, setQrCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text) return;

    setIsLoading(true);
    try {
      const qrCodeDataUrl = await generateQrCode(text);
      setQrCode(qrCodeDataUrl as string);
    } catch (error) {
      console.error(error);
      // TODO: 사용자에게 에러 메시지 표시
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 w-full max-w-md items-center justify-between font-mono text-sm lg:flex flex-col gap-8">
        <h1 className="text-4xl font-bold text-center">QR 코드 생성기</h1>
        <p className="text-center text-muted-foreground">
          URL 또는 텍스트를 입력하여 QR 코드를 생성하세요.
        </p>
        <Card className="w-full">
          <CardHeader>
            <CardTitle>QR 코드 생성</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleGenerate} className="flex flex-col gap-4">
              <Input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="URL 또는 텍스트 입력"
                required
              />
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "생성 중..." : "QR 코드 생성"}
              </Button>
            </form>
            {qrCode && (
              <div className="mt-8 flex flex-col items-center justify-center gap-4">
                <h2 className="text-2xl font-semibold">생성된 QR 코드</h2>
                <Image
                  src={qrCode}
                  alt="Generated QR Code"
                  width={256}
                  height={256}
                  className="rounded-lg"
                />
                <Button asChild>
                  <a href={qrCode} download="qrcode.png">
                    PNG로 다운로드
                  </a>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
