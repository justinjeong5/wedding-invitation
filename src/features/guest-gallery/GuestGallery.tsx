"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useAdminMode } from "@/hooks/useAdminMode";
import { useSubmissionOpen } from "@/hooks/useSubmissionOpen";
import { AnimatePresence, motion } from "framer-motion";
import SectionWrapper from "@/components/ui/SectionWrapper";
import RefreshButton from "@/components/ui/RefreshButton";
import { getGuestPhotos } from "@/features/guest-gallery/actions";
import { usePaginatedData } from "@/hooks/usePaginatedData";
import UploadForm from "@/features/guest-gallery/UploadForm";
import PhotoCard from "@/features/guest-gallery/PhotoCard";
import Lightbox from "@/features/guest-gallery/Lightbox";
import IntroModal, { INTRO_KEY } from "@/features/guest-gallery/IntroModal";
import type { GuestPhoto } from "@/types";

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

export default function GuestGallery() {
  const [formOpen, setFormOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [showIntro, setShowIntro] = useState(false);
  const introTriggered = useRef(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  const submissionOpen = useSubmissionOpen();

  useEffect(() => {
    if (!submissionOpen) return;
    if (localStorage.getItem(INTRO_KEY)) return;
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !introTriggered.current) {
          introTriggered.current = true;
          setShowIntro(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [submissionOpen]);

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
    <div ref={sectionRef}>
      <AnimatePresence>
        {showIntro && (
          <IntroModal
            onStart={() => { setShowIntro(false); setFormOpen(true); }}
            onClose={() => setShowIntro(false)}
          />
        )}
      </AnimatePresence>
      <SectionWrapper id="guest-gallery">
      <h2 className="text-lg font-light text-primary mb-2 tracking-wider text-center">
        하객 갤러리
      </h2>
      <p className="text-xs text-text-muted font-light mb-6 text-center">
        여러분의 눈으로 본 우리의 하루를 나눠주세요
      </p>

      {submissionOpen ? (
        <>
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
        </>
      ) : (
        <p className="text-xs text-text-muted/70 text-center mb-6">
          갤러리 업로드 기간이 종료되었습니다
        </p>
      )}

      {!loading && photos.length > 0 && (
        <div className="flex justify-end mb-2">
          <RefreshButton refreshing={refreshing} cooldown={cooldown} onRefresh={refresh} />
        </div>
      )}

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

      <p className="text-[10px] text-text-muted/60 text-center mt-6 leading-relaxed">
        결혼식과 여러분의 이야기를 사진으로 나눠주세요.
        <br />
        모두가 함께 보는 공간이며, 부적절한 이미지는 별도의 고지 없이 삭제될 수 있습니다.
      </p>

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
    </div>
  );
}
