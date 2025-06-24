"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, StarOff } from "lucide-react";
import { deleteTemplate, updateTemplate } from "@/app/actions/qr-code";
import { QrCodeOptions } from "@/app/actions/qr-code";
import { toast } from "sonner";
import { Template } from "@/types/data-manager";

interface TemplateListProps {
  templates: Template[];
  onLoadTemplate: (settings: QrCodeOptions) => void;
  onEditTemplate: (template: Template) => void;
  onTemplateUpdate: () => void;
}

export default function TemplateList({
  templates,
  onLoadTemplate,
  onEditTemplate,
  onTemplateUpdate,
}: TemplateListProps) {
  const handleDeleteTemplate = async (templateId: string) => {
    if (!confirm("정말로 이 템플릿을 삭제하시겠습니까?")) {
      return;
    }

    try {
      await deleteTemplate(templateId);
      toast.success("템플릿이 삭제되었습니다!");
      onTemplateUpdate();
    } catch (error) {
      console.error("템플릿 삭제 오류:", error);
      toast.error("템플릿 삭제에 실패했습니다.");
    }
  };

  const handleLoadTemplate = (template: Template) => {
    try {
      const settings = JSON.parse(template.settings) as QrCodeOptions;
      onLoadTemplate(settings);
      toast.success(`"${template.name}" 템플릿이 적용되었습니다!`);
    } catch (error) {
      console.error("템플릿 로드 오류:", error);
      toast.error("템플릿 로드에 실패했습니다.");
    }
  };

  const handleToggleDefault = async (template: Template) => {
    try {
      await updateTemplate(template.id, {
        isDefault: !template.isDefault,
      });
      toast.success(
        template.isDefault
          ? "기본 템플릿에서 해제되었습니다."
          : "기본 템플릿으로 설정되었습니다.",
      );
      onTemplateUpdate();
    } catch (error) {
      console.error("기본 템플릿 설정 오류:", error);
      toast.error("기본 템플릿 설정에 실패했습니다.");
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
      {templates.map((template) => (
        <div
          key={template.id}
          className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
        >
          <div className="flex items-center gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium">{template.name}</span>
                {template.isDefault && (
                  <Badge variant="secondary" className="text-xs">
                    기본
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {new Date(template.updatedAt).toLocaleDateString("ko-KR")}
              </p>
            </div>
          </div>
          <div className="flex gap-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleToggleDefault(template)}
              title={
                template.isDefault ? "기본 템플릿 해제" : "기본 템플릿으로 설정"
              }
            >
              {template.isDefault ? (
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              ) : (
                <StarOff className="h-4 w-4 text-gray-400" />
              )}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleLoadTemplate(template)}
            >
              적용
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onEditTemplate(template)}
            >
              편집
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="text-red-500"
              onClick={() => handleDeleteTemplate(template.id)}
            >
              삭제
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
