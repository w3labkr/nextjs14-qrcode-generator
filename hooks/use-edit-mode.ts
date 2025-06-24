"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import type { EditModeState } from "@/types/qr-code";
import type { QrCodeOptions } from "@/app/actions/qr-code";
import { useQrFormStore } from "@/hooks/use-qr-form-store";

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
  const toastShownRef = useRef<Set<string>>(new Set());
  const { loadFromQrContent } = useQrFormStore();

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
          setActiveTab(qrCodeData.type);

          // QR 코드 content를 파싱하여 폼 데이터로 로드
          loadFromQrContent(qrCodeData.content, qrCodeData.type);

          if (qrCodeData.settings) {
            const settings =
              typeof qrCodeData.settings === "string"
                ? JSON.parse(qrCodeData.settings)
                : qrCodeData.settings;
            loadSettings(settings);
          }

          // 로드된 QR 코드 ID를 먼저 설정한 후 토스트 표시 (중복 방지)
          setLoadedQrCodeId(qrCodeId);

          // 이미 토스트를 표시한 QR 코드인지 확인
          if (!toastShownRef.current.has(qrCodeId)) {
            toastShownRef.current.add(qrCodeId);
            toast.success("편집할 QR 코드를 불러왔습니다.");
          }
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
    // 편집 모드 종료 시 토스트 기록도 초기화
    toastShownRef.current.clear();
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
  }, [searchParams, setActiveTab, loadQrCodeForEdit]);

  return {
    isEditMode,
    editingQrCodeId,
    loadQrCodeForEdit,
    exitEditMode,
  };
}
