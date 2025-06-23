"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Bookmark } from "lucide-react";
import { exportUserData } from "@/app/actions/data-management";
import { downloadAsJSON } from "@/lib/download-utils";

interface TemplatesJSONExportButtonProps {
  disabled?: boolean;
}

export default function TemplatesJSONExportButton({
  disabled = false,
}: TemplatesJSONExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleTemplatesJSONExport = async () => {
    try {
      setIsExporting(true);

      // 데이터 가져오기
      const data = await exportUserData();
      const date = new Date().toISOString().split("T")[0];

      // 템플릿 데이터만 추출
      const templatesData = {
        templates: data.templates,
        exportDate: new Date().toISOString(),
        dataType: "templates",
        count: data.templates.length,
      };

      // 파일명 생성
      const filename = `templates-${date}.json`;

      // 다운로드 실행
      downloadAsJSON(templatesData, filename);

      // 사용자에게 다운로드 시작 알림
      toast.success(
        `템플릿 JSON 다운로드가 시작되었습니다! (${data.templates.length}개)`,
        {
          description: "템플릿 데이터가 JSON 파일로 다운로드됩니다.",
        },
      );

      // 브라우저가 팝업을 차단했을 경우를 대비한 추가 안내
      setTimeout(() => {
        toast.info(
          "다운로드가 시작되지 않았다면 브라우저의 팝업 차단 설정을 확인해주세요.",
          {
            duration: 3000,
          },
        );
      }, 1000);
    } catch (error) {
      console.error("템플릿 JSON 내보내기 오류:", error);
      toast.error("템플릿 JSON 데이터 내보내기에 실패했습니다.", {
        description:
          error instanceof Error
            ? error.message
            : "알 수 없는 오류가 발생했습니다.",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button
      onClick={handleTemplatesJSONExport}
      disabled={disabled || isExporting}
      variant="outline"
      className="w-full"
    >
      <Bookmark className="h-4 w-4 mr-2" />
      {isExporting ? "내보내는 중..." : "템플릿 JSON 내보내기"}
    </Button>
  );
}
