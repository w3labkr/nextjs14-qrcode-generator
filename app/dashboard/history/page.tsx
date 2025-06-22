"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Search,
  Filter,
  Heart,
  MoreVertical,
  Download,
  Trash2,
  Star,
  QrCode,
  ExternalLink,
  Edit2,
  Calendar,
  SortAsc,
  SortDesc,
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import Link from "next/link";

interface QrCodeData {
  id: string;
  type: string;
  title: string | null;
  content: string;
  settings: any;
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
}

interface PaginationData {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

const QR_CODE_TYPES = {
  URL: { label: "웹사이트", color: "bg-blue-100 text-blue-800" },
  TEXT: { label: "텍스트", color: "bg-gray-100 text-gray-800" },
  WIFI: { label: "Wi-Fi", color: "bg-green-100 text-green-800" },
  EMAIL: { label: "이메일", color: "bg-purple-100 text-purple-800" },
  SMS: { label: "문자메시지", color: "bg-yellow-100 text-yellow-800" },
  VCARD: { label: "연락처", color: "bg-pink-100 text-pink-800" },
  LOCATION: { label: "위치", color: "bg-red-100 text-red-800" },
};

export default function QrCodeHistoryPage() {
  const { data: session, status } = useSession();
  const [qrCodes, setQrCodes] = useState<QrCodeData[]>([]);
  const [pagination, setPagination] = useState<PaginationData>({
    total: 0,
    page: 1,
    limit: 12,
    pages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [showFavorites, setShowFavorites] = useState(false);
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [qrCodeToDelete, setQrCodeToDelete] = useState<string | null>(null);

  const fetchQrCodes = async () => {
    if (!session?.user?.id) return;

    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        search: searchTerm,
        type: selectedType,
        favorite: showFavorites.toString(),
        sortBy,
        sortOrder,
      });

      const response = await fetch(`/api/qrcodes?${params}`);
      const data = await response.json();

      if (response.ok) {
        setQrCodes(data.qrCodes);
        setPagination(data.pagination);
      } else {
        toast.error(data.error || "QR 코드 목록을 불러오는데 실패했습니다.");
      }
    } catch (error) {
      console.error("QR 코드 목록 조회 실패:", error);
      toast.error("QR 코드 목록을 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === "authenticated") {
      fetchQrCodes();
    }
  }, [
    status,
    pagination.page,
    searchTerm,
    selectedType,
    showFavorites,
    sortBy,
    sortOrder,
  ]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const toggleFavorite = async (qrCodeId: string) => {
    try {
      const response = await fetch(`/api/qrcodes/${qrCodeId}/favorite`, {
        method: "POST",
      });

      if (response.ok) {
        setQrCodes((prev) =>
          prev.map((qr) =>
            qr.id === qrCodeId ? { ...qr, isFavorite: !qr.isFavorite } : qr,
          ),
        );
        toast.success("즐겨찾기가 업데이트되었습니다.");
      } else {
        const data = await response.json();
        toast.error(data.error || "즐겨찾기 업데이트에 실패했습니다.");
      }
    } catch (error) {
      console.error("즐겨찾기 토글 실패:", error);
      toast.error("즐겨찾기 업데이트에 실패했습니다.");
    }
  };

  const deleteQrCode = async (qrCodeId: string) => {
    try {
      const response = await fetch(`/api/qrcodes/${qrCodeId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setQrCodes((prev) => prev.filter((qr) => qr.id !== qrCodeId));
        toast.success("QR 코드가 삭제되었습니다.");
      } else {
        const data = await response.json();
        toast.error(data.error || "QR 코드 삭제에 실패했습니다.");
      }
    } catch (error) {
      console.error("QR 코드 삭제 실패:", error);
      toast.error("QR 코드 삭제에 실패했습니다.");
    } finally {
      setDeleteDialogOpen(false);
      setQrCodeToDelete(null);
    }
  };

  const handlePageChange = (newPage: number) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  const handleEdit = (qrCode: QrCodeData) => {
    const editUrl = `/?edit=${qrCode.id}&type=${qrCode.type.toLowerCase()}`;
    window.location.href = editUrl;
  };

  const getContentPreview = (content: string, type: string) => {
    if (type === "WIFI") {
      try {
        const wifiData = JSON.parse(content);
        return `SSID: ${wifiData.ssid}`;
      } catch {
        return content.substring(0, 50) + "...";
      }
    }
    return content.length > 50 ? content.substring(0, 50) + "..." : content;
  };

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">로그인이 필요합니다</h1>
          <p className="text-muted-foreground mb-6">
            QR 코드 히스토리를 보려면 로그인해주세요.
          </p>
          <Link href="/auth/signin">
            <Button>로그인하기</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* 검색 및 필터 */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4">
            <form onSubmit={handleSearch} className="flex-1">
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

      {/* QR 코드 목록 */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-4">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-32 bg-gray-200 rounded mb-4"></div>
                <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : qrCodes.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <QrCode className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">QR 코드가 없습니다</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || selectedType !== "all" || showFavorites
                ? "검색 조건에 맞는 QR 코드가 없습니다."
                : "아직 생성한 QR 코드가 없습니다."}
            </p>
            <Link href="/dashboard">
              <Button>첫 번째 QR 코드 만들기</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {qrCodes.map((qrCode) => (
            <Card
              key={qrCode.id}
              className="group hover:shadow-lg transition-shadow"
            >
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-2">
                      <Badge
                        variant="secondary"
                        className={
                          QR_CODE_TYPES[
                            qrCode.type as keyof typeof QR_CODE_TYPES
                          ]?.color
                        }
                      >
                        {QR_CODE_TYPES[
                          qrCode.type as keyof typeof QR_CODE_TYPES
                        ]?.label || qrCode.type}
                      </Badge>
                      {qrCode.isFavorite && (
                        <Heart className="h-4 w-4 text-red-500 fill-current" />
                      )}
                    </div>
                    <CardTitle className="text-base line-clamp-2">
                      {qrCode.title || "제목 없음"}
                    </CardTitle>
                    <CardDescription className="text-sm">
                      {format(new Date(qrCode.createdAt), "yyyy년 M월 d일", {
                        locale: ko,
                      })}
                    </CardDescription>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => toggleFavorite(qrCode.id)}
                      >
                        <Star className="h-4 w-4 mr-2" />
                        {qrCode.isFavorite ? "즐겨찾기 해제" : "즐겨찾기 추가"}
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Download className="h-4 w-4 mr-2" />
                        다운로드
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleEdit(qrCode)}>
                        <Edit2 className="h-4 w-4 mr-2" />
                        편집
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-red-600"
                        onClick={() => {
                          setQrCodeToDelete(qrCode.id);
                          setDeleteDialogOpen(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        삭제
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent>
                <div className="aspect-square bg-white border rounded-lg mb-4 flex items-center justify-center">
                  <QrCode className="h-24 w-24 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {getContentPreview(qrCode.content, qrCode.type)}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* 페이지네이션 */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-center space-x-2 mt-8">
          <Button
            variant="outline"
            onClick={() => handlePageChange(pagination.page - 1)}
            disabled={pagination.page === 1}
          >
            이전
          </Button>

          {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
            const pageNumber =
              Math.max(1, Math.min(pagination.pages - 4, pagination.page - 2)) +
              i;
            return (
              <Button
                key={pageNumber}
                variant={pageNumber === pagination.page ? "default" : "outline"}
                onClick={() => handlePageChange(pageNumber)}
                size="sm"
              >
                {pageNumber}
              </Button>
            );
          })}

          <Button
            variant="outline"
            onClick={() => handlePageChange(pagination.page + 1)}
            disabled={pagination.page === pagination.pages}
          >
            다음
          </Button>
        </div>
      )}

      {/* 삭제 확인 다이얼로그 */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>QR 코드 삭제</AlertDialogTitle>
            <AlertDialogDescription>
              정말로 이 QR 코드를 삭제하시겠습니까? 이 작업은 되돌릴 수
              없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => qrCodeToDelete && deleteQrCode(qrCodeToDelete)}
              className="bg-red-600 hover:bg-red-700"
            >
              삭제
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
