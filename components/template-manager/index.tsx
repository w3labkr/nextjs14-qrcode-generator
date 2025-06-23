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
  const [error, setError] = useState<string | null>(null);

  const loadTemplates = async (showErrorToast = true) => {
    try {
      setLoading(true);
      setError(null);
      const templatesData = await getUserTemplates();
      setTemplates(templatesData);
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "템플릿을 불러오는데 실패했습니다.";
      console.error("템플릿 로드 오류:", error);
      setError(errorMessage);

      if (showErrorToast) {
        toast.error(errorMessage);
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

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>템플릿 관리</CardTitle>
          <CardDescription>
            자주 사용하는 설정을 템플릿으로 저장하고 재사용하세요.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={() => loadTemplates(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              다시 시도
            </button>
          </div>
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
