"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import axios from "axios";

import { SearchAndFilters } from "./components/search-and-filters";
import { QrCodeGrid } from "./components/qr-code-grid";
import { Pagination } from "./components/pagination";
import { DeleteConfirmDialog } from "./components/delete-confirm-dialog";
import { EditTitleDialog } from "./components/edit-title-dialog";

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
  const [editTitleDialogOpen, setEditTitleDialogOpen] = useState(false);
  const [qrCodeToEdit, setQrCodeToEdit] = useState<{
    id: string;
    title: string | null;
  } | null>(null);
  const [isEditingTitle, setIsEditingTitle] = useState(false);

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

      const response = await axios.get(`/api/qrcodes?${params}`);
      const data = response.data;

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
      await axios.post(`/api/qrcodes/${qrCodeId}/favorite`);

      setQrCodes((prev) =>
        prev.map((qr) =>
          qr.id === qrCodeId ? { ...qr, isFavorite: !qr.isFavorite } : qr,
        ),
      );
      toast.success("즐겨찾기가 업데이트되었습니다.");
    } catch (error: any) {
      console.error("즐겨찾기 토글 실패:", error);
      const errorMessage =
        error.response?.data?.error || "즐겨찾기 업데이트에 실패했습니다.";
      toast.error(errorMessage);
    }
  };

  const deleteQrCode = async (qrCodeId: string) => {
    if (!qrCodeId || typeof qrCodeId !== "string") {
      console.warn("Invalid qrCodeId:", qrCodeId);
      return;
    }

    try {
      await axios.delete(`/api/qrcodes/${qrCodeId}`);

      setQrCodes((prev) => prev.filter((qr) => qr.id !== qrCodeId));
      toast.success("QR 코드가 삭제되었습니다.");
    } catch (error: any) {
      console.error("QR 코드 삭제 실패:", error);
      const errorMessage =
        error.response?.data?.error || "QR 코드 삭제에 실패했습니다.";
      toast.error(errorMessage);
    } finally {
      setDeleteDialogOpen(false);
      setQrCodeToDelete(null);
    }
  };

  const handleEditTitle = (qrCodeId: string, currentTitle: string | null) => {
    setQrCodeToEdit({ id: qrCodeId, title: currentTitle });
    setEditTitleDialogOpen(true);
  };

  const updateQrCodeTitle = async (newTitle: string) => {
    if (!qrCodeToEdit) return;

    try {
      setIsEditingTitle(true);
      await axios.patch(`/api/qrcodes/${qrCodeToEdit.id}`, {
        title: newTitle || null,
      });

      setQrCodes((prev) =>
        prev.map((qr) =>
          qr.id === qrCodeToEdit.id ? { ...qr, title: newTitle || null } : qr,
        ),
      );
      toast.success("제목이 업데이트되었습니다.");
    } catch (error: any) {
      console.error("제목 수정 실패:", error);
      const errorMessage =
        error.response?.data?.error || "제목 수정에 실패했습니다.";
      toast.error(errorMessage);
    } finally {
      setIsEditingTitle(false);
      setEditTitleDialogOpen(false);
      setQrCodeToEdit(null);
    }
  };

  const handlePageChange = (newPage: number) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
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
        onDelete={(id) => {
          setQrCodeToDelete(id);
          setDeleteDialogOpen(true);
        }}
        onEditTitle={handleEditTitle}
      />

      <Pagination pagination={pagination} onPageChange={handlePageChange} />

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={() => qrCodeToDelete && deleteQrCode(qrCodeToDelete)}
      />

      <EditTitleDialog
        open={editTitleDialogOpen}
        onOpenChange={setEditTitleDialogOpen}
        onConfirm={updateQrCodeTitle}
        currentTitle={qrCodeToEdit?.title || ""}
        loading={isEditingTitle}
      />
    </>
  );
}
