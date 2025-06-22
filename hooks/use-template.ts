"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { getDefaultTemplate } from "@/app/actions/qr-code";
import type { QrCodeOptions } from "@/app/actions/qr-code";

interface UseTemplateProps {
  loadSettings: (settings: QrCodeOptions) => void;
}

export function useTemplate({ loadSettings }: UseTemplateProps) {
  const { data: session } = useSession();
  const [templateApplied, setTemplateApplied] = useState(false);
  const [defaultTemplateLoaded, setDefaultTemplateLoaded] = useState(false);
  const isInitializing = useRef(false);

  const handleLoadTemplate = useCallback(
    async (settings: QrCodeOptions) => {
      loadSettings(settings);
      setTemplateApplied(true);
    },
    [loadSettings],
  );

  useEffect(() => {
    const loadDefaultTemplate = async () => {
      if (session?.user && !defaultTemplateLoaded && !isInitializing.current) {
        isInitializing.current = true;
        try {
          const defaultTemplate = await getDefaultTemplate();
          if (defaultTemplate) {
            const settings = JSON.parse(defaultTemplate.settings);
            await handleLoadTemplate(settings);
            setDefaultTemplateLoaded(true);
            toast.success(
              `기본 템플릿 "${defaultTemplate.name}"이 적용되었습니다.`,
            );
          }
        } catch (error) {
          console.error("기본 템플릿 로드 오류:", error);
        } finally {
          isInitializing.current = false;
        }
      }
    };

    loadDefaultTemplate();
  }, [session?.user, defaultTemplateLoaded, handleLoadTemplate]);

  useEffect(() => {
    const savedSettings = localStorage.getItem("qr-template-settings");
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings);
        handleLoadTemplate(settings);
        localStorage.removeItem("qr-template-settings");
        toast.success("템플릿이 적용되었습니다!");
      } catch (error) {
        console.error("템플릿 설정 로드 오류:", error);
      }
    }
  }, [handleLoadTemplate]);

  return {
    templateApplied,
    defaultTemplateLoaded,
    handleLoadTemplate,
    setTemplateApplied,
  };
}
