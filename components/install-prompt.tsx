"use client";

import { useInstallPrompt } from "@/hooks/use-install-prompt";
import { Button } from "@/components/ui/button";
import { Download, Smartphone, Check } from "lucide-react";
import { toast } from "sonner";

export function InstallPrompt() {
  const { isInstallable, isInstalled, installApp } = useInstallPrompt();

  const handleInstall = async () => {
    const installed = await installApp();
    if (installed) {
      toast.success("앱이 설치되었습니다!");
    }
  };

  if (isInstalled) {
    return (
      <Button variant="outline" disabled className="gap-2">
        <Check className="h-4 w-4" />
        설치됨
      </Button>
    );
  }

  if (!isInstallable) {
    return null;
  }

  return (
    <Button onClick={handleInstall} variant="outline" className="gap-2">
      <Smartphone className="h-4 w-4" />앱 설치
    </Button>
  );
}

export function InstallPromptBanner() {
  const { isInstallable, isInstalled, installApp } = useInstallPrompt();

  const handleInstall = async () => {
    const installed = await installApp();
    if (installed) {
      toast.success("앱이 설치되었습니다!");
    }
  };

  if (!isInstallable || isInstalled) {
    return null;
  }

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Smartphone className="h-5 w-5 text-blue-600" />
          <div>
            <h4 className="font-medium text-blue-900">앱으로 설치하기</h4>
            <p className="text-sm text-blue-700">
              홈 화면에 추가하여 더 빠르게 접근하세요
            </p>
          </div>
        </div>
        <Button onClick={handleInstall} size="sm" className="gap-2">
          <Download className="h-4 w-4" />
          설치
        </Button>
      </div>
    </div>
  );
}
