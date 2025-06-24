"use client";

import { Button } from "@/components/ui/button";
import { QrCodeOptions } from "@/app/actions/qr-code";
import { toast } from "sonner";
import { Template } from "@/types/data-manager";
import SaveTemplateButton from "./save-template-button";
import EditTemplateDialog from "./edit-template-dialog";
import DeleteTemplateDialog from "./delete-template-dialog";

interface TemplateListProps {
  templates: Template[];
  onLoadTemplate: (settings: QrCodeOptions, templateId: string) => void;
  onTemplateUpdate: () => void;
  activeTemplateId?: string;
  currentSettings: QrCodeOptions;
}

export default function TemplateList({
  templates,
  onLoadTemplate,
  onTemplateUpdate,
  activeTemplateId,
  currentSettings,
}: TemplateListProps) {
  const handleLoadTemplate = (template: Template) => {
    try {
      const settings = JSON.parse(template.settings) as QrCodeOptions;
      onLoadTemplate(settings, template.id);
      toast.success(`"${template.name}" 템플릿이 적용되었습니다!`);
    } catch (error) {
      console.error("템플릿 로드 오류:", error);
      toast.error("템플릿 로드에 실패했습니다.");
    }
  };

  if (templates.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>저장된 템플릿이 없습니다.</p>
        <p className="text-sm">현재 설정을 템플릿으로 저장해보세요!</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {templates.map((template) => {
        const isActive = activeTemplateId === template.id;
        return (
          <div
            key={template.id}
            className={`flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer ${
              isActive
                ? "border-blue-500 bg-blue-50/50 shadow-sm"
                : "border-gray-200"
            }`}
            onClick={() => handleLoadTemplate(template)}
          >
            <div className="flex items-center gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{template.name}</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {new Date(template.updatedAt).toLocaleDateString("ko-KR")}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <SaveTemplateButton
                template={template}
                currentSettings={currentSettings}
                onTemplateUpdate={onTemplateUpdate}
              />
              <EditTemplateDialog
                template={template}
                onUpdateComplete={onTemplateUpdate}
              />
              <DeleteTemplateDialog
                templateId={template.id}
                onTemplateDeleted={onTemplateUpdate}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
