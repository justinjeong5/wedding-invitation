"use client";

import {
  useActionState,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { useAdminMode } from "@/hooks/useAdminMode";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import SectionWrapper from "@/components/ui/SectionWrapper";
import RefreshButton from "@/components/ui/RefreshButton";
import {
  uploadGuestPhoto,
  getGuestPhotos,
  deleteGuestPhoto,
} from "@/actions/guest-gallery";
import { validateImage, validateAspectRatio, resizeImage } from "@/lib/image-resize";
import { usePaginatedData } from "@/hooks/usePaginatedData";
import { useVisitorId } from "@/components/VisitTracker";
import { formatRelativeDate } from "@/lib/format";
import type { GuestPhoto } from "@/types";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const STORAGE_BASE = `${SUPABASE_URL}/storage/v1/object/public/guest-photos`;

function getImageUrl(path: string) {
  return `${STORAGE_BASE}/${path}`;
}

/* ─── Upload Form ─── */
function UploadForm({ onUploaded }: { onUploaded: () => void }) {
  const visitorId = useVisitorId();
  const [preview, setPreview] = useState<string | null>(null);
  const [resizing, setResizing] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const resizedFileRef = useRef<File | null>(null);

  const handleSubmit = async (
    _prevState: { success: boolean; error?: string },
    formData: FormData
  ) => {
    if (resizedFileRef.current) {
      formData.set("image", resizedFileRef.current);
    }
    const result = await uploadGuestPhoto(_prevState, formData);
    if (result.success) {
      if (preview) URL.revokeObjectURL(preview);
      formRef.current?.reset();
      setPreview(null);
      resizedFileRef.current = null;
      onUploaded();
    }
    return result;
  };

  const [state, formAction, isPending] = useActionState(handleSubmit, {
    success: false,
  });

  const [fileError, setFileError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const error = validateImage(file);
    if (error) {
      setFileError(error);
      setPreview(null);
      resizedFileRef.current = null;
      e.target.value = "";
      return;
    }

    setFileError(null);
    const previewUrl = URL.createObjectURL(file);
    setPreview(previewUrl);
    setResizing(true);
    try {
      // 비율 검증을 위해 이미지 로드
      const img = await new Promise<HTMLImageElement>((resolve, reject) => {
        const i = new window.Image();
        i.onload = () => resolve(i);
        i.onerror = reject;
        i.src = previewUrl;
      });
      const ratioError = validateAspectRatio(img.naturalWidth, img.naturalHeight);
      if (ratioError) {
        setFileError(ratioError);
        URL.revokeObjectURL(previewUrl);
        setPreview(null);
        resizedFileRef.current = null;
        e.target.value = "";
        setResizing(false);
        return;
      }
      resizedFileRef.current = await resizeImage(file);
    } catch {
      resizedFileRef.current = file;
    }
    setResizing(false);
  };

  return (
    <form ref={formRef} action={formAction} className="space-y-3 mb-6" data-1p-ignore>
      <input type="hidden" name="visitor_id" value={visitorId} />
      {/* Photo picker */}
      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        className="w-full border-2 border-dashed border-border rounded-xl overflow-hidden transition-colors hover:border-primary/40"
        style={{ minHeight: "auto" }}
      >
        {preview ? (
          <div className="relative w-full aspect-[4/3]">
            <Image
              src={preview}
              alt="미리보기"
              fill
              className="object-cover"
              sizes="480px"
              unoptimized
            />
            {(resizing || isPending) && (
              <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center gap-2">
                <div className="h-6 w-6 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                <p className="text-white text-xs">
                  {resizing ? "사진 변환 중..." : "업로드 중..."}
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="py-10 text-center">
            <svg
              viewBox="0 0 24 24"
              className="w-8 h-8 mx-auto mb-2 text-text-muted/50"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z"
              />
            </svg>
            <p className="text-xs text-text-muted">사진을 선택해주세요</p>
          </div>
        )}
      </button>
      <input
        ref={fileRef}
        type="file"
        name="image"
        accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
        className="hidden"
        onChange={handleFileChange}
      />
      {fileError && (
        <p className="text-red-500 text-xs" role="alert">{fileError}</p>
      )}

      {/* Name + Password */}
      <div className="flex gap-2">
        <input
          name="name"
          type="text"
          placeholder="이름"
          required
          className="flex-1 px-3 py-2.5 text-sm border border-border rounded-lg bg-bg-card focus:outline-none focus:border-primary"
        />
        <input
          name="password"
          type="password"
          autoComplete="off"
          placeholder="비밀번호"
          required
          className="w-24 px-3 py-2.5 text-sm border border-border rounded-lg bg-bg-card focus:outline-none focus:border-primary"
        />
      </div>
      <p className="text-[10px] text-text-muted/60 -mt-1">
        비밀번호는 사진 삭제 시 본인 확인에 사용됩니다.
      </p>

      {/* Caption */}
      <div className="relative">
        <input
          name="caption"
          type="text"
          placeholder="한 마디 남기기 (선택)"
          maxLength={50}
          className="w-full px-3 py-2.5 text-sm border border-border rounded-lg bg-bg-card focus:outline-none focus:border-primary pr-12"
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-text-muted pointer-events-none">
          / 50
        </span>
      </div>

      {state.error && (
        <p className="text-red-500 text-xs" role="alert">{state.error}</p>
      )}

      <button
        type="submit"
        disabled={isPending || resizing || !preview}
        className="w-full py-2.5 text-sm bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50"
      >
        {isPending ? "올리는 중..." : "사진 올리기"}
      </button>
    </form>
  );
}

/* ─── Photo Card ─── */
function PhotoCard({
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

      {/* Delete button */}
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

/* ─── Lightbox ─── */
const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? "100%" : "-100%", opacity: 0.5 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? "-100%" : "100%", opacity: 0.5 }),
};

function Lightbox({
  photos,
  initialIndex,
  onClose,
}: {
  photos: GuestPhoto[];
  initialIndex: number;
  onClose: () => void;
}) {
  const [index, setIndex] = useState(initialIndex);
  const [direction, setDirection] = useState(0);
  const [bounce, setBounce] = useState<"left" | "right" | null>(null);
  const [loadedSet, setLoadedSet] = useState<Set<number>>(new Set());
  const photo = photos[index];
  const touchStartX = useRef(0);
  const touchDeltaX = useRef(0);
  const dragRef = useRef<HTMLDivElement>(null);

  const paginate = useCallback(
    (dir: number) => {
      const next = index + dir;
      if (next < 0 || next >= photos.length) {
        setBounce(dir < 0 ? "left" : "right");
        setTimeout(() => setBounce(null), 400);
        return;
      }
      setDirection(dir);
      setIndex(next);
    },
    [index, photos.length]
  );

  useEffect(() => {
    document.body.style.overflow = "hidden";
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") paginate(-1);
      if (e.key === "ArrowRight") paginate(1);
    };
    window.addEventListener("keydown", handleKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKey);
    };
  }, [onClose, paginate]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchDeltaX.current = 0;
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    touchDeltaX.current = e.touches[0].clientX - touchStartX.current;
  };
  const handleTouchEnd = () => {
    if (Math.abs(touchDeltaX.current) > 50) {
      paginate(touchDeltaX.current > 0 ? -1 : 1);
    }
  };

  if (!photo) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed top-0 left-0 w-full h-[100dvh] z-50 bg-black flex flex-col"
      onClick={onClose}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 text-white/80">
        <span className="text-sm">
          {index + 1} / {photos.length}
        </span>
        <button
          onClick={onClose}
          className="w-8 h-8 flex items-center justify-center"
          style={{ minHeight: "auto" }}
          aria-label="닫기"
          type="button"
        >
          <svg
            viewBox="0 0 24 24"
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      {/* Image with swipe animation */}
      <div
        ref={dragRef}
        className="flex-1 relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <AnimatePresence initial={false} custom={direction} mode="popLayout">
          <motion.div
            key={index}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate={
              bounce
                ? { x: bounce === "left" ? 30 : -30, opacity: 1 }
                : "center"
            }
            exit="exit"
            transition={
              bounce
                ? { type: "spring", stiffness: 500, damping: 30 }
                : { duration: 0.25, ease: "easeInOut" }
            }
            className="absolute inset-0"
          >
            {!loadedSet.has(index) && (
              <div className="absolute inset-0 flex items-center justify-center z-10">
                <div className="h-8 w-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              </div>
            )}
            <Image
              src={getImageUrl(photo.storage_path)}
              alt={photo.caption || `${photo.name}님의 사진`}
              fill
              className="object-contain"
              sizes="100vw"
              priority
              unoptimized
              onLoad={() => setLoadedSet(prev => new Set(prev).add(index))}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Caption */}
      <div
        className="px-4 py-3 text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-white text-sm font-medium">{photo.name}</p>
        {photo.caption && (
          <p className="text-white/70 text-xs mt-1">{photo.caption}</p>
        )}
        <p className="text-white/40 text-[10px] mt-1">
          {formatRelativeDate(photo.created_at)}
        </p>
      </div>
    </motion.div>
  );
}

/* ─── Skeleton ─── */
function GallerySkeleton() {
  return (
    <div className="grid grid-cols-3 gap-1">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="aspect-square bg-border/30 rounded-lg animate-pulse"
        />
      ))}
    </div>
  );
}

/* ─── Empty State ─── */
function EmptyState() {
  return (
    <div className="text-center py-10">
      <svg
        viewBox="0 0 24 24"
        className="w-12 h-12 mx-auto mb-3 text-text-muted/30"
        fill="none"
        stroke="currentColor"
        strokeWidth={1}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M2.25 18V6a2.25 2.25 0 012.25-2.25h15A2.25 2.25 0 0121.75 6v12A2.25 2.25 0 0119.5 20.25H4.5A2.25 2.25 0 012.25 18z"
        />
      </svg>
      <p className="text-sm text-text-muted mb-1">아직 사진이 없습니다</p>
      <p className="text-xs text-text-muted/70">
        첫 번째 사진을 올려주세요!
      </p>
    </div>
  );
}

/* ─── Main Component ─── */
export default function GuestGallery() {
  const [formOpen, setFormOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const { isAdmin, adminPasswordRef } = useAdminMode();

  const fetchPhotos = useCallback(
    async (cursor?: string) => {
      const result = await getGuestPhotos(cursor);
      return { items: result.photos, hasMore: result.hasMore };
    },
    []
  );

  const {
    items: photos,
    setItems: setPhotos,
    loading,
    loadingMore,
    refreshing,
    cooldown,
    refresh,
    reload,
    sentinelRef,
  } = usePaginatedData<GuestPhoto>({
    fetchFn: fetchPhotos,
    getCursor: (photo) => photo.created_at,
  });

  const handleUploaded = () => {
    setFormOpen(false);
    reload();
  };

  const handleDeleted = (id: string) => {
    setPhotos((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <SectionWrapper id="guest-gallery">
      <h2 className="text-lg font-light text-primary mb-2 tracking-wider text-center">
        하객 갤러리
      </h2>
      <p className="text-xs text-text-muted font-light mb-6 text-center">
        여러분의 눈으로 본 우리의 하루를 나눠주세요
      </p>

      {/* Toggle upload form */}
      <div className="text-center mb-6">
        <button
          onClick={() => setFormOpen(!formOpen)}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs text-primary border border-primary/30 rounded-full hover:bg-primary/5 transition-colors"
          style={{ minHeight: "auto" }}
        >
          <svg
            viewBox="0 0 24 24"
            className={`w-3.5 h-3.5 transition-transform duration-200 ${formOpen ? "rotate-45" : ""}`}
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 4.5v15m7.5-7.5h-15"
            />
          </svg>
          사진 남기기
        </button>
      </div>

      <AnimatePresence initial={false}>
        {formOpen && (
          <motion.div
            key="upload-form"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <UploadForm onUploaded={handleUploaded} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Refresh */}
      {!loading && photos.length > 0 && (
        <div className="flex justify-end mb-2">
          <RefreshButton refreshing={refreshing} cooldown={cooldown} onRefresh={refresh} />
        </div>
      )}

      {/* Photo Grid */}
      {loading ? (
        <GallerySkeleton />
      ) : photos.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          <div className="grid grid-cols-3 gap-1">
            {photos.map((photo, i) => (
              <PhotoCard
                key={photo.id}
                photo={photo}
                isAdmin={isAdmin}
                adminPassword={adminPasswordRef.current}
                onDelete={handleDeleted}
                onClick={() => setLightboxIndex(i)}
              />
            ))}
          </div>
          <div ref={sentinelRef} className="h-1" />
          {loadingMore && (
            <div className="flex justify-center py-4">
              <div className="h-5 w-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            </div>
          )}
        </>
      )}

      {/* Notice */}
      <p className="text-[10px] text-text-muted/60 text-center mt-6 leading-relaxed">
        결혼식과 여러분의 이야기를 사진으로 나눠주세요.
        <br />
        모두가 함께 보는 공간이며, 부적절한 이미지는 별도의 고지 없이 삭제될 수 있습니다.
      </p>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxIndex !== null && (
          <Lightbox
            photos={photos}
            initialIndex={lightboxIndex}
            onClose={() => setLightboxIndex(null)}
          />
        )}
      </AnimatePresence>
    </SectionWrapper>
  );
}
