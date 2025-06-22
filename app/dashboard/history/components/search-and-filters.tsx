"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Heart } from "lucide-react";

const QR_CODE_TYPES = {
  URL: { label: "웹사이트", color: "bg-blue-100 text-blue-800" },
  TEXT: { label: "텍스트", color: "bg-gray-100 text-gray-800" },
  WIFI: { label: "Wi-Fi", color: "bg-green-100 text-green-800" },
  EMAIL: { label: "이메일", color: "bg-purple-100 text-purple-800" },
  SMS: { label: "문자메시지", color: "bg-yellow-100 text-yellow-800" },
  VCARD: { label: "연락처", color: "bg-pink-100 text-pink-800" },
  LOCATION: { label: "위치", color: "bg-red-100 text-red-800" },
};

interface SearchAndFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedType: string;
  setSelectedType: (type: string) => void;
  showFavorites: boolean;
  setShowFavorites: (show: boolean) => void;
  sortBy: string;
  setSortBy: (sort: string) => void;
  sortOrder: string;
  setSortOrder: (order: string) => void;
  onSearch: (e: React.FormEvent) => void;
}

export function SearchAndFilters({
  searchTerm,
  setSearchTerm,
  selectedType,
  setSelectedType,
  showFavorites,
  setShowFavorites,
  sortBy,
  setSortBy,
  sortOrder,
  setSortOrder,
  onSearch,
}: SearchAndFiltersProps) {
  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4">
          <form onSubmit={onSearch} className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="제목이나 내용으로 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </form>

          <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger className="w-full md:w-40">
              <SelectValue placeholder="유형 선택" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">모든 유형</SelectItem>
              {Object.entries(QR_CODE_TYPES).map(([type, info]) => (
                <SelectItem key={type} value={type}>
                  {info.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            variant={showFavorites ? "default" : "outline"}
            onClick={() => setShowFavorites(!showFavorites)}
            className="w-full md:w-auto"
          >
            <Heart
              className={`h-4 w-4 mr-2 ${showFavorites ? "fill-current" : ""}`}
            />
            즐겨찾기
          </Button>

          <Select
            value={`${sortBy}-${sortOrder}`}
            onValueChange={(value) => {
              const [field, order] = value.split("-");
              setSortBy(field);
              setSortOrder(order);
            }}
          >
            <SelectTrigger className="w-full md:w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="createdAt-desc">최신순</SelectItem>
              <SelectItem value="createdAt-asc">오래된순</SelectItem>
              <SelectItem value="title-asc">제목 A-Z</SelectItem>
              <SelectItem value="title-desc">제목 Z-A</SelectItem>
              <SelectItem value="type-asc">유형순</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}
