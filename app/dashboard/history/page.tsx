"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
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
    const editUrl = `/qrcode?edit=${qrCode.id}&type=${qrCode.type.toLowerCase()}`;
    window.location.href = editUrl;
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
