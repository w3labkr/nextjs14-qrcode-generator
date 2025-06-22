"use client";

import { Button } from "@/components/ui/button";

interface PaginationData {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

interface PaginationProps {
  pagination: PaginationData;
  onPageChange: (page: number) => void;
}

export function Pagination({ pagination, onPageChange }: PaginationProps) {
  if (pagination.pages <= 1) {
    return null;
  }

  return (
    <div className="flex items-center justify-center space-x-2 mt-8">
      <Button
        variant="outline"
        onClick={() => onPageChange(pagination.page - 1)}
        disabled={pagination.page === 1}
      >
        이전
      </Button>

      {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
        const pageNumber =
          Math.max(1, Math.min(pagination.pages - 4, pagination.page - 2)) + i;
        return (
          <Button
            key={pageNumber}
            variant={pageNumber === pagination.page ? "default" : "outline"}
            onClick={() => onPageChange(pageNumber)}
            size="sm"
          >
            {pageNumber}
          </Button>
        );
      })}

      <Button
        variant="outline"
        onClick={() => onPageChange(pagination.page + 1)}
        disabled={pagination.page === pagination.pages}
      >
        다음
      </Button>
    </div>
  );
}
