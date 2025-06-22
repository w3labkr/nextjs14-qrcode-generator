"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Save, Edit, Trash2, Star, StarOff } from "lucide-react";
import {
  getUserTemplates,
  saveTemplate,
  updateTemplate,
  deleteTemplate,
} from "@/app/actions/qr-code";
import { QrCodeOptions } from "@/app/actions/qr-code";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";

interface Template {
  id: string;
  name: string;
  settings: string;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

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
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [templateName, setTemplateName] = useState("");
  const [isDefault, setIsDefault] = useState(false);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const templatesData = await getUserTemplates();
      setTemplates(templatesData);
    } catch (error) {
      console.error("템플릿 로드 오류:", error);
      toast.error("템플릿을 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTemplates();
  }, []);

  const handleSaveTemplate = async () => {
    if (!templateName.trim()) {
      toast.error("템플릿 이름을 입력해주세요.");
      return;
    }

    try {
      await saveTemplate({
        name: templateName,
        settings: currentSettings,
        isDefault,
      });

      toast.success("템플릿이 저장되었습니다!");
      setTemplateName("");
      setIsDefault(false);
      setSaveDialogOpen(false);
      loadTemplates();
    } catch (error) {
      console.error("템플릿 저장 오류:", error);
      toast.error("템플릿 저장에 실패했습니다.");
    }
  };

  const handleUpdateTemplate = async () => {
    if (!editingTemplate || !templateName.trim()) {
      toast.error("템플릿 이름을 입력해주세요.");
      return;
    }

    try {
      await updateTemplate(editingTemplate.id, {
        name: templateName,
        isDefault,
      });

      toast.success("템플릿이 업데이트되었습니다!");
      setEditDialogOpen(false);
      setEditingTemplate(null);
      setTemplateName("");
      setIsDefault(false);
      loadTemplates();
    } catch (error) {
      console.error("템플릿 업데이트 오류:", error);
      toast.error("템플릿 업데이트에 실패했습니다.");
    }
  };

  const handleDeleteTemplate = async (templateId: string) => {
    if (!confirm("정말로 이 템플릿을 삭제하시겠습니까?")) {
      return;
    }

    try {
      await deleteTemplate(templateId);
      toast.success("템플릿이 삭제되었습니다!");
      loadTemplates();
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
      loadTemplates();
    } catch (error) {
      console.error("기본 템플릿 설정 오류:", error);
      toast.error("기본 템플릿 설정에 실패했습니다.");
    }
  };

  const openEditDialog = (template: Template) => {
    setEditingTemplate(template);
    setTemplateName(template.name);
    setIsDefault(template.isDefault);
    setEditDialogOpen(true);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>템플릿 관리</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-12 bg-gray-200 animate-pulse rounded" />
            ))}
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
          <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Save className="h-4 w-4 mr-2" />
                현재 설정 저장
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>템플릿 저장</DialogTitle>
                <DialogDescription>
                  현재 QR 코드 설정을 템플릿으로 저장합니다.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="template-name">템플릿 이름</Label>
                  <Input
                    id="template-name"
                    value={templateName}
                    onChange={(e) => setTemplateName(e.target.value)}
                    placeholder="예: 회사 로고 템플릿"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="default-template"
                    checked={isDefault}
                    onCheckedChange={setIsDefault}
                  />
                  <Label htmlFor="default-template">기본 템플릿으로 설정</Label>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setSaveDialogOpen(false)}
                >
                  취소
                </Button>
                <Button onClick={handleSaveTemplate}>저장</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {templates.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>저장된 템플릿이 없습니다.</p>
            <p className="text-sm">현재 설정을 템플릿으로 저장해보세요!</p>
          </div>
        ) : (
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
                      template.isDefault
                        ? "기본 템플릿 해제"
                        : "기본 템플릿으로 설정"
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
                    variant="ghost"
                    onClick={() => openEditDialog(template)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDeleteTemplate(template.id)}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      {/* 템플릿 편집 다이얼로그 */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>템플릿 편집</DialogTitle>
            <DialogDescription>
              템플릿 이름과 설정을 변경할 수 있습니다.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-template-name">템플릿 이름</Label>
              <Input
                id="edit-template-name"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                placeholder="템플릿 이름을 입력하세요"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="edit-default-template"
                checked={isDefault}
                onCheckedChange={setIsDefault}
              />
              <Label htmlFor="edit-default-template">
                기본 템플릿으로 설정
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setEditDialogOpen(false);
                setEditingTemplate(null);
                setTemplateName("");
                setIsDefault(false);
              }}
            >
              취소
            </Button>
            <Button onClick={handleUpdateTemplate}>저장</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
