"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getUserTemplates } from "@/app/actions/qr-code";
import { QrCodeOptions } from "@/app/actions/qr-code";
import { toast } from "sonner";
import { Template } from "@/types/data-manager";
import SaveTemplateDialog from "./save-template-dialog";
import EditTemplateDialog from "./edit-template-dialog";
import TemplateList from "./template-list";
import LoadingSkeleton from "./loading-skeleton";

interface TemplateManagerProps {
  currentSettings: QrCodeOptions;
  onLoadTemplate: (settings: QrCodeOptions) => void;
}

export default function TemplateManager({
  currentSettings,
  onLoadTemplate,
}: TemplateManagerProps) {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [hasShownError, setHasShownError] = useState(false);

  const loadTemplates = async (showErrorToast = true) => {
    try {
      setLoading(true);
      const templatesData = await getUserTemplates();
      setTemplates(templatesData);
      // 성공하면 에러 상태 리셋
      setHasShownError(false);
    } catch (error) {
      console.error("템플릿 로드 오류:", error);
      // 중복 에러 메시지 방지: 이미 에러를 표시했거나 showErrorToast가 false면 토스트 표시 안함
      if (showErrorToast && !hasShownError) {
        toast.error("템플릿을 불러오는데 실패했습니다.");
        setHasShownError(true);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // 초기 로드시에는 에러 토스트를 표시하지 않음
    loadTemplates(false);
  }, []);

  const openEditDialog = (template: Template) => {
    setEditingTemplate(template);
    setEditDialogOpen(true);
  };

  const closeEditDialog = () => {
    setEditDialogOpen(false);
    setEditingTemplate(null);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>템플릿 관리</CardTitle>
        </CardHeader>
        <CardContent>
          <LoadingSkeleton />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>템플릿 관리</CardTitle>
            <CardDescription>
              자주 사용하는 설정을 템플릿으로 저장하고 재사용하세요.
            </CardDescription>
          </div>
          <SaveTemplateDialog
            currentSettings={currentSettings}
            onSaveComplete={() => loadTemplates(true)}
          />
        </div>
      </CardHeader>
      <CardContent>
        <TemplateList
          templates={templates}
          onLoadTemplate={onLoadTemplate}
          onEditTemplate={openEditDialog}
          onTemplateUpdate={() => loadTemplates(true)}
        />
      </CardContent>

      <EditTemplateDialog
        template={editingTemplate}
        isOpen={editDialogOpen}
        onClose={closeEditDialog}
        onUpdateComplete={() => loadTemplates(true)}
      />
    </Card>
  );
}
