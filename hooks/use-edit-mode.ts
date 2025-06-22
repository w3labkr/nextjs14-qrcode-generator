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
  const [loadedQrCodeId, setLoadedQrCodeId] = useState<string | null>(null);

  const loadQrCodeForEdit = useCallback(
    async (qrCodeId: string) => {
      // 이미 로드한 QR 코드인지 확인하여 중복 로딩 방지
      if (loadedQrCodeId === qrCodeId) {
        return;
      }

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

          setLoadedQrCodeId(qrCodeId);
          toast.success("편집할 QR 코드를 불러왔습니다.");
        } else {
          toast.error("QR 코드를 불러오는데 실패했습니다.");
        }
      } catch (error) {
        console.error("QR 코드 로드 실패:", error);
        toast.error("QR 코드를 불러오는데 실패했습니다.");
      }
    },
    [setQrData, loadSettings, loadedQrCodeId],
  );

  const exitEditMode = useCallback(() => {
    setIsEditMode(false);
    setEditingQrCodeId(null);
    setLoadedQrCodeId(null);
    window.history.replaceState({}, "", "/");
  }, []);

  useEffect(() => {
    const editId = searchParams.get("edit");
    const editType = searchParams.get("type");

    if (editId && editType) {
      setIsEditMode(true);
      setEditingQrCodeId(editId);
      setActiveTab(editType);

      // 이미 로드한 QR 코드가 아닌 경우에만 로드
      if (loadedQrCodeId !== editId) {
        loadQrCodeForEdit(editId);
      }
    } else {
      // URL에 편집 파라미터가 없으면 편집 모드 해제
      setIsEditMode(false);
      setEditingQrCodeId(null);
      setLoadedQrCodeId(null);
    }
  }, [searchParams, setActiveTab, loadQrCodeForEdit, loadedQrCodeId]);

  return {
    isEditMode,
    editingQrCodeId,
    loadQrCodeForEdit,
    exitEditMode,
  };
}
