"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

import { SearchAndFilters } from "./components/search-and-filters";
import { QrCodeGrid } from "./components/qr-code-grid";
import { Pagination } from "./components/pagination";
import { DeleteConfirmDialog } from "./components/delete-confirm-dialog";

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

export default function QrCodeHistoryPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const editingQrCodeId = searchParams.get("returnFrom");
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
        search: searchTerm.trim(),
        type: selectedType,
        favorite: showFavorites.toString(),
        sortBy,
        sortOrder,
      });

      const response = await fetch(`/api/qrcodes?${params}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.qrCodes && Array.isArray(data.qrCodes)) {
        setQrCodes(data.qrCodes);
        setPagination(
          data.pagination || {
            total: 0,
            page: 1,
            limit: 12,
            pages: 0,
          },
        );
      } else {
        console.warn("Invalid data structure received:", data);
        toast.error("잘못된 데이터 형식입니다.");
      }
    } catch (error) {
      console.error("QR 코드 목록 조회 실패:", error);
      toast.error("QR 코드 목록을 불러오는데 실패했습니다.");
      // 에러 발생시 빈 배열로 초기화
      setQrCodes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === "authenticated") {
      fetchQrCodes();
    }
  }, [status, pagination.page, selectedType, showFavorites, sortBy, sortOrder]);

  // 검색어 변경시 디바운스 처리
  useEffect(() => {
    if (status !== "authenticated") return;

    const timeoutId = setTimeout(() => {
      setPagination((prev) => ({ ...prev, page: 1 }));
      fetchQrCodes();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  // returnFrom 파라미터가 있을 때 URL에서 제거
  useEffect(() => {
    if (editingQrCodeId) {
      const timer = setTimeout(() => {
        const currentUrl = new URL(window.location.href);
        currentUrl.searchParams.delete("returnFrom");
        window.history.replaceState({}, "", currentUrl.toString());
      }, 3000); // 3초 후 파라미터 제거

      return () => clearTimeout(timer);
    }
  }, [editingQrCodeId]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // 검색은 이미 useEffect에서 디바운스 처리되므로 여기서는 아무것도 하지 않음
  };

  const toggleFavorite = async (qrCodeId: string) => {
    if (!qrCodeId || typeof qrCodeId !== "string") {
      console.warn("Invalid qrCodeId:", qrCodeId);
      return;
    }

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
    if (!qrCodeId || typeof qrCodeId !== "string") {
      console.warn("Invalid qrCodeId:", qrCodeId);
      return;
    }

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
    if (!qrCode || !qrCode.id || !qrCode.type) {
      console.warn("Invalid qrCode data for edit:", qrCode);
      toast.error("잘못된 QR 코드 정보입니다.");
      return;
    }

    // QR 코드 타입에 따라 적절한 페이지로 라우팅
    const qrType = qrCode.type.toLowerCase();
    let editUrl: string;

    switch (qrType) {
      case "url":
        editUrl = `/qrcode/url?edit=${qrCode.id}&type=url`;
        break;
      case "text":
        editUrl = `/qrcode/text?edit=${qrCode.id}&type=text`;
        break;
      case "wifi":
        editUrl = `/qrcode/wifi?edit=${qrCode.id}&type=wifi`;
        break;
      case "email":
        editUrl = `/qrcode/email?edit=${qrCode.id}&type=email`;
        break;
      case "sms":
        editUrl = `/qrcode/sms?edit=${qrCode.id}&type=sms`;
        break;
      case "vcard":
        editUrl = `/qrcode/vcard?edit=${qrCode.id}&type=vcard`;
        break;
      case "location":
        editUrl = `/qrcode/location?edit=${qrCode.id}&type=location`;
        break;
      default:
        // 알 수 없는 타입의 경우 기본 페이지로
        editUrl = `/qrcode/url?edit=${qrCode.id}&type=${qrType}`;
    }

    router.push(editUrl);
  };

  return (
    <>
      <SearchAndFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedType={selectedType}
        setSelectedType={setSelectedType}
        showFavorites={showFavorites}
        setShowFavorites={setShowFavorites}
        sortBy={sortBy}
        setSortBy={setSortBy}
        sortOrder={sortOrder}
        setSortOrder={setSortOrder}
        onSearch={handleSearch}
      />

      <QrCodeGrid
        qrCodes={qrCodes}
        loading={loading}
        searchTerm={searchTerm}
        selectedType={selectedType}
        showFavorites={showFavorites}
        onToggleFavorite={toggleFavorite}
        onEdit={handleEdit}
        onDelete={(id) => {
          setQrCodeToDelete(id);
          setDeleteDialogOpen(true);
        }}
        editingQrCodeId={editingQrCodeId}
      />

      <Pagination pagination={pagination} onPageChange={handlePageChange} />

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={() => qrCodeToDelete && deleteQrCode(qrCodeToDelete)}
      />
    </>
  );
}
