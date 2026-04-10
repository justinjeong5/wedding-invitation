"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Zoom, Keyboard, Virtual } from "swiper/modules";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import SectionWrapper from "@/components/ui/SectionWrapper";
import { WEDDING_CONFIG } from "@/config/wedding";
import type { GalleryImage } from "@/types";

import "swiper/css";
import "swiper/css/zoom";
import "swiper/css/virtual";

const GRID_COLS: Record<number, string> = {
  1: "grid-cols-1",
  2: "grid-cols-2",
  3: "grid-cols-3",
};

function isCompositeRow(
  row: unknown
): row is { landscape: readonly number[]; portrait: number } {
  return typeof row === "object" && row !== null && "portrait" in row;
}

export default function Gallery() {
  const { images, layout } = WEDDING_CONFIG.gallery;
  const [isOpen, setIsOpen] = useState(false);
  const [slideIndex, setSlideIndex] = useState(0);

  const openLightbox = useCallback((idx: number) => {
    setSlideIndex(idx);
    setIsOpen(true);
  }, []);

  const closeLightbox = useCallback(() => {
    setIsOpen(false);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, closeLightbox]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const eagerSet = useMemo(
    () =>
      new Set<number>(
        layout
          .flatMap((row) =>
            isCompositeRow(row) ? [...row.landscape, row.portrait] : [...row]
          )
          .slice(0, 4)
      ),
    [layout]
  );

  const handleImageLoad = useCallback(
    (e: React.SyntheticEvent<HTMLImageElement>) => {
      e.currentTarget.dataset.loaded = "true";
    },
    []
  );

  function renderImage(
    image: GalleryImage,
    idx: number,
    sizes: string,
    style?: React.CSSProperties
  ) {
    return (
      <div
        key={idx}
        className="gallery-item gallery-shimmer relative rounded-xl overflow-hidden cursor-pointer"
        style={{ aspectRatio: `${image.width} / ${image.height}`, ...style }}
        onClick={() => openLightbox(idx)}
      >
        <Image
          src={image.src}
          alt={image.alt}
          fill
          className="gallery-img object-cover"
          sizes={sizes}
          loading={eagerSet.has(idx) ? "eager" : "lazy"}
          onLoad={handleImageLoad}
          onError={handleImageLoad}
        />
      </div>
    );
  }

  return (
    <>
      <SectionWrapper id="gallery" className="text-center">
        <h2 className="text-lg font-light text-primary mb-8 tracking-wider">
          갤러리
        </h2>

        <div className="space-y-1.5">
          {layout.map((row, rowIdx) => {
            if (isCompositeRow(row)) {
              return (
                <div
                  key={rowIdx}
                  className="grid gap-1.5"
                  style={{ gridTemplateColumns: "6fr 6fr 7fr" }}
                >
                  {row.landscape.map((idx) =>
                    renderImage(images[idx], idx, "32vw")
                  )}
                  <div
                    key={row.portrait}
                    className="gallery-item gallery-shimmer relative rounded-xl overflow-hidden cursor-pointer"
                    style={{ gridColumn: 3, gridRow: "1 / 3" }}
                    onClick={() => openLightbox(row.portrait)}
                  >
                    <Image
                      src={images[row.portrait].src}
                      alt={images[row.portrait].alt}
                      fill
                      className="gallery-img object-cover"
                      sizes="37vw"
                      loading={eagerSet.has(row.portrait) ? "eager" : "lazy"}
                      onLoad={handleImageLoad}
                      onError={handleImageLoad}
                    />
                  </div>
                </div>
              );
            }

            const gridRow = row as readonly number[];
            const sizes =
              gridRow.length === 1
                ? "(max-width: 480px) 100vw, 480px"
                : gridRow.length === 2
                  ? "50vw"
                  : "33vw";

            return (
              <div
                key={rowIdx}
                className={`grid ${GRID_COLS[gridRow.length]} gap-1.5`}
              >
                {gridRow.map((idx) => renderImage(images[idx], idx, sizes))}
              </div>
            );
          })}
        </div>
      </SectionWrapper>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed top-0 left-0 w-full h-[100dvh] z-50 bg-black"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.25 }}
            onClick={closeLightbox}
          >
            <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-4 pt-3 pb-10 bg-gradient-to-b from-black/50 to-transparent">
              <span className="text-white/70 text-sm">
                {slideIndex + 1} / {images.length}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  closeLightbox();
                }}
                className="text-white/80 hover:text-white p-2.5 -m-1"
                aria-label="닫기"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="w-6 h-6"
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

            <div className="w-full h-full" onClick={(e) => e.stopPropagation()}>
              <Swiper
                modules={[Zoom, Keyboard, Virtual]}
                virtual={{
                  enabled: true,
                  addSlidesBefore: 2,
                  addSlidesAfter: 2,
                }}
                zoom={{ maxRatio: 3 }}
                keyboard={{ enabled: true }}
                initialSlide={slideIndex}
                slidesPerView={1}
                rewind
                className="w-full h-full"
                onSlideChange={(swiper) => setSlideIndex(swiper.realIndex)}
              >
                {images.map((image, index) => (
                  <SwiperSlide key={index} virtualIndex={index}>
                    <div className="swiper-zoom-container">
                      <Image
                        src={image.src}
                        alt={image.alt}
                        fill
                        className="object-contain"
                        sizes="100vw"
                        quality={85}
                      />
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>

            <div className="absolute bottom-0 left-0 right-0 z-10 text-center px-4 pb-6 pt-10 bg-gradient-to-t from-black/50 to-transparent">
              <p className="text-white/80 text-sm font-serif font-light tracking-wider">
                {images[slideIndex].alt}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
