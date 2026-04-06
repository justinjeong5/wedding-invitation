"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { deleteGuestPhoto } from "@/features/guest-gallery/actions";
import { getImageUrl } from "@/features/guest-gallery/constants";
import type { GuestPhoto } from "@/types";

export default function PhotoCard({
  photo,
  isAdmin,
  adminPassword,
  onDelete,
  onClick,
}: {
  photo: GuestPhoto;
  isAdmin: boolean;
  adminPassword?: string;
  onDelete: (id: string) => void;
  onClick: () => void;
}) {
  const [showDelete, setShowDelete] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const menuBtnRef = useRef<HTMLButtonElement>(null);

  const handleDelete = async () => {
    if (!isAdmin && !password) return;
    setLoading(true);
    setError("");
    const pw = isAdmin ? (adminPassword ?? "") : password;
    const result = await deleteGuestPhoto(photo.id, pw, isAdmin);
    if (result.success) {
      onDelete(photo.id);
    } else {
      setError(result.error ?? "삭제 실패");
    }
    setLoading(false);
  };

  return (
    <div className="relative group">
      <button
        onClick={onClick}
        className="w-full aspect-square relative overflow-hidden rounded-lg bg-border/20"
        style={{ minHeight: "auto" }}
      >
        <Image
          src={getImageUrl(photo.storage_path)}
          alt={photo.caption || `${photo.name}님의 사진`}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 480px) 33vw, 160px"
          loading="lazy"
        />
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/50 to-transparent p-2 pt-6">
          <p className="text-white text-[11px] font-medium truncate">
            {photo.caption || photo.name}
          </p>
        </div>
      </button>

      <button
        ref={menuBtnRef}
        onClick={(e) => {
          e.stopPropagation();
          setShowDelete(!showDelete);
        }}
        className="absolute top-1.5 right-1.5 w-7 h-7 rounded-full bg-black/50 text-white text-sm flex items-center justify-center"
        style={{ minHeight: "auto" }}
        aria-label="사진 메뉴"
        type="button"
      >
        &#8942;
      </button>

      {showDelete && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => {
              setShowDelete(false);
              setError("");
              setPassword("");
            }}
          />
          <div
            className="fixed z-20 bg-bg-card border border-border rounded-lg shadow-lg p-3 w-44"
            style={{
              top: menuBtnRef.current
                ? menuBtnRef.current.getBoundingClientRect().bottom + 4
                : 0,
              left: menuBtnRef.current
                ? Math.min(
                    Math.max(8, menuBtnRef.current.getBoundingClientRect().left - 140),
                    window.innerWidth - 184
                  )
                : 0,
            }}
          >
            {isAdmin ? (
              <button
                onClick={handleDelete}
                disabled={loading}
                className="w-full text-xs text-red-500 py-1.5 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                style={{ minHeight: "auto" }}
              >
                {loading ? "삭제 중..." : "관리자 삭제"}
              </button>
            ) : (
              <div className="space-y-2">
                <input
                  type="password"
                  autoComplete="off"
                  placeholder="비밀번호"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleDelete()}
                  className="w-full px-2 py-1.5 text-xs border border-border rounded bg-bg focus:outline-none focus:border-primary"
                  data-1p-ignore
                />
                <button
                  onClick={handleDelete}
                  disabled={loading || !password}
                  className="w-full text-xs text-red-500 py-1.5 border border-red-200 rounded hover:bg-red-50 transition-colors disabled:opacity-50"
                  style={{ minHeight: "auto" }}
                >
                  {loading ? "삭제 중..." : "삭제"}
                </button>
              </div>
            )}
            {error && (
              <p className="text-red-500 text-[10px] mt-1" role="alert">{error}</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
