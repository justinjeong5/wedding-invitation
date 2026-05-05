"use client";

import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperClass } from "swiper";
import { Keyboard, Virtual } from "swiper/modules";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import SectionWrapper from "@/components/ui/SectionWrapper";
import { WEDDING_CONFIG } from "@/config/wedding";
import type { GalleryImage } from "@/types";

import "swiper/css";
import "swiper/css/virtual";

const GRID_COLS: Record<number, string> = {
  1: "grid-cols-1",
  2: "grid-cols-2",
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
  const [rotated, setRotated] = useState<Set<number>>(new Set());
  const [rotateHintOpen, setRotateHintOpen] = useState(false);
  const swiperRef = useRef<SwiperClass | null>(null);

  const dismissRotateHint = useCallback(() => {
    setRotateHintOpen(false);
    try {
      localStorage.setItem("gallery-rotate-hint-seen", "1");
    } catch {}
  }, []);

  const openLightbox = useCallback((idx: number) => {
    setSlideIndex(idx);
    setIsOpen(true);
  }, []);

  const closeLightbox = useCallback(() => {
    setIsOpen(false);
    setRotated(new Set());
  }, []);

  const toggleRotate = useCallback(() => {
    setRotated((prev) => {
      const next = new Set(prev);
      if (next.has(slideIndex)) next.delete(slideIndex);
      else next.add(slideIndex);
      return next;
    });
  }, [slideIndex]);

  const preventContextMenu = useCallback(
    (e: React.MouseEvent | React.SyntheticEvent) => {
      e.preventDefault();
    },
    []
  );

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

  useEffect(() => {
    if (!isOpen) {
      setRotateHintOpen(false);
      return;
    }
    const current = images[slideIndex];
    if (!current || current.width <= current.height) {
      setRotateHintOpen(false);
      return;
    }
    let seen = false;
    try {
      seen = localStorage.getItem("gallery-rotate-hint-seen") === "1";
    } catch {}
    if (!seen) setRotateHintOpen(true);
  }, [isOpen, slideIndex, images]);

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
          onContextMenu={preventContextMenu}
          draggable={false}
        />
      </div>
    );
  }

  function renderIntrinsicImage(
    image: GalleryImage,
    idx: number,
    sizes: string
  ) {
    return (
      <div
        key={idx}
        className="gallery-item gallery-shimmer relative rounded-xl overflow-hidden cursor-pointer"
        onClick={() => openLightbox(idx)}
      >
        <Image
          src={image.src}
          alt={image.alt}
          width={image.width}
          height={image.height}
          className="gallery-img w-full h-auto"
          sizes={sizes}
          loading={eagerSet.has(idx) ? "eager" : "lazy"}
          onLoad={handleImageLoad}
          onError={handleImageLoad}
          onContextMenu={preventContextMenu}
          draggable={false}
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
                  style={{ gridTemplateColumns: "9fr 9fr 8fr" }}
                >
                  {row.landscape.map((idx) =>
                    renderImage(images[idx], idx, "34vw")
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
                      sizes="32vw"
                      loading={eagerSet.has(row.portrait) ? "eager" : "lazy"}
                      onLoad={handleImageLoad}
                      onError={handleImageLoad}
                      onContextMenu={preventContextMenu}
                      draggable={false}
                    />
                  </div>
                </div>
              );
            }

            const gridRow = row as readonly number[];
            const sizes =
              gridRow.length === 1
                ? "(max-width: 480px) 100vw, 480px"
                : "50vw";

            return (
              <div
                key={rowIdx}
                className={`grid ${GRID_COLS[gridRow.length]} gap-1.5 items-start`}
              >
                {gridRow.map((idx) => renderIntrinsicImage(images[idx], idx, sizes))}
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
              <div className="flex items-center gap-1">
                {images[slideIndex].width > images[slideIndex].height && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      dismissRotateHint();
                      toggleRotate();
                    }}
                    className="text-white/80 hover:text-white p-2.5 -m-1"
                    aria-label={
                      rotated.has(slideIndex) ? "원래대로" : "세로로 보기"
                    }
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
                        d="M4 4v6h6M20 20v-6h-6M4 10a8 8 0 0114-5l2 2M20 14a8 8 0 01-14 5l-2-2"
                      />
                    </svg>
                  </button>
                )}
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
            </div>

            <div className="relative w-full h-full" onClick={(e) => e.stopPropagation()}>
              <Swiper
                modules={[Keyboard, Virtual]}
                virtual={{
                  enabled: true,
                  addSlidesBefore: 2,
                  addSlidesAfter: 2,
                }}
                keyboard={{ enabled: true }}
                initialSlide={slideIndex}
                slidesPerView={1}
                className="w-full h-full"
                onSwiper={(s) => {
                  swiperRef.current = s;
                }}
                onSlideChange={(swiper) => {
                  setSlideIndex(swiper.realIndex);
                  setRotated(new Set());
                }}
              >
                {images.map((image, index) => {
                  const isRotated = rotated.has(index);
                  return (
                    <SwiperSlide key={index} virtualIndex={index}>
                      <div className="relative w-full h-full overflow-hidden">
                        <div
                          className="absolute top-1/2 left-1/2 transition-transform duration-300"
                          style={
                            isRotated
                              ? {
                                  width: "100dvh",
                                  height: "100vw",
                                  transform: "translate(-50%, -50%) rotate(-90deg)",
                                }
                              : {
                                  width: "100vw",
                                  height: "100dvh",
                                  transform: "translate(-50%, -50%)",
                                }
                          }
                        >
                          <Image
                            src={image.src}
                            alt={image.alt}
                            fill
                            className={isRotated ? "object-cover" : "object-contain"}
                            sizes="100vw"
                            quality={85}
                            onContextMenu={preventContextMenu}
                            draggable={false}
                          />
                        </div>
                      </div>
                    </SwiperSlide>
                  );
                })}
              </Swiper>

              {/* 좌/우 영역 클릭 (인스타 패턴) — swipe와 공존, 첫/마지막 슬라이드에선 비활성 */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  swiperRef.current?.slidePrev();
                }}
                disabled={slideIndex === 0}
                className="absolute left-0 top-[15%] bottom-[15%] w-[20%] z-10 group flex items-center justify-start pl-2 disabled:pointer-events-none"
                style={{ minHeight: "auto" }}
                aria-label="이전 사진"
              >
                {slideIndex > 0 && (
                  <span className="opacity-0 group-hover:opacity-100 group-active:opacity-100 transition-opacity bg-black/40 backdrop-blur-sm rounded-full w-9 h-9 flex items-center justify-center text-white/90">
                    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                  </span>
                )}
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  swiperRef.current?.slideNext();
                }}
                disabled={slideIndex === images.length - 1}
                className="absolute right-0 top-[15%] bottom-[15%] w-[20%] z-10 group flex items-center justify-end pr-2 disabled:pointer-events-none"
                style={{ minHeight: "auto" }}
                aria-label="다음 사진"
              >
                {slideIndex < images.length - 1 && (
                  <span className="opacity-0 group-hover:opacity-100 group-active:opacity-100 transition-opacity bg-black/40 backdrop-blur-sm rounded-full w-9 h-9 flex items-center justify-center text-white/90">
                    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </span>
                )}
              </button>

              {/* 회전 버튼 첫 진입 안내 — localStorage로 영구 dismiss */}
              <AnimatePresence>
                {rotateHintOpen && (
                  <motion.div
                    className="absolute inset-0 z-30"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      dismissRotateHint();
                    }}
                  >
                    <motion.div
                      className="absolute top-[3.5rem] right-3 max-w-[260px] bg-bg-card text-text rounded-2xl shadow-2xl px-5 py-4"
                      initial={{ opacity: 0, y: -8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.96 }}
                      transition={{ duration: 0.25, ease: "easeOut" }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div
                        className="absolute -top-1.5 right-12 w-3 h-3 bg-bg-card rotate-45 shadow-[-1px_-1px_2px_rgba(0,0,0,0.04)]"
                        aria-hidden="true"
                      />
                      <div className="flex items-start gap-2.5">
                        <span className="shrink-0 w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center text-primary">
                          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v6h6M20 20v-6h-6M4 10a8 8 0 0114-5l2 2M20 14a8 8 0 01-14 5l-2-2" />
                          </svg>
                        </span>
                        <div className="text-left">
                          <p className="text-sm font-medium text-text mb-0.5">
                            세로로 크게 보기
                          </p>
                          <p className="text-xs text-text-light leading-relaxed">
                            가로 사진은 회전 버튼으로
                            <br />
                            화면 가득 볼 수 있어요
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          dismissRotateHint();
                        }}
                        className="mt-3 w-full text-xs text-primary border border-primary/30 rounded-lg py-1.5 hover:bg-primary/5 transition-colors"
                        style={{ minHeight: "auto" }}
                      >
                        확인
                      </button>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
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
