"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import type { EditModeState } from "@/types/qr-code";
import type { QrCodeOptions } from "@/app/actions/qr-code";

interface UseEditModeProps {
  setQrData: (data: string) => void;
  setActiveTab: (tab: string) => void;
  loadSettings: (settings: QrCodeOptions) => void;
}

export function useEditMode({
  setQrData,
  setActiveTab,
  loadSettings,
}: UseEditModeProps) {
  const searchParams = useSearchParams();
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingQrCodeId, setEditingQrCodeId] = useState<string | null>(null);

  const loadQrCodeForEdit = useCallback(
    async (qrCodeId: string) => {
      try {
        const response = await fetch(`/api/qrcodes/${qrCodeId}`);
        if (response.ok) {
          const qrCodeData = await response.json();

          setQrData(qrCodeData.content);

          if (qrCodeData.settings) {
            const settings =
              typeof qrCodeData.settings === "string"
                ? JSON.parse(qrCodeData.settings)
                : qrCodeData.settings;
            loadSettings(settings);
          }

          toast.success("편집할 QR 코드를 불러왔습니다.");
        } else {
          toast.error("QR 코드를 불러오는데 실패했습니다.");
        }
      } catch (error) {
        console.error("QR 코드 로드 실패:", error);
        toast.error("QR 코드를 불러오는데 실패했습니다.");
      }
    },
    [setQrData, loadSettings],
  );

  const exitEditMode = useCallback(() => {
    setIsEditMode(false);
    setEditingQrCodeId(null);
    window.history.replaceState({}, "", "/");
  }, []);

  useEffect(() => {
    const editId = searchParams.get("edit");
    const editType = searchParams.get("type");

    if (editId && editType) {
      setIsEditMode(true);
      setEditingQrCodeId(editId);
      setActiveTab(editType);
      loadQrCodeForEdit(editId);
    }
  }, [searchParams, setActiveTab, loadQrCodeForEdit]);

  return {
    isEditMode,
    editingQrCodeId,
    loadQrCodeForEdit,
    exitEditMode,
  };
}
