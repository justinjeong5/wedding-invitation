"use client";

import { useState, useCallback, useEffect } from "react";
import type { Swiper as SwiperType } from "swiper";
import { Swiper, SwiperSlide } from "swiper/react";
import {
  Autoplay,
  Pagination,
  EffectFade,
  Zoom,
  FreeMode,
  Thumbs,
  Keyboard,
} from "swiper/modules";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import SectionWrapper from "@/components/ui/SectionWrapper";
import { WEDDING_CONFIG } from "@/config/wedding";

import "swiper/css";
import "swiper/css/effect-fade";
import "swiper/css/pagination";
import "swiper/css/zoom";
import "swiper/css/free-mode";
import "swiper/css/thumbs";

export default function Gallery() {
  const { gallery } = WEDDING_CONFIG;
  const [thumbsSwiper, setThumbsSwiper] = useState<SwiperType | null>(null);
  const [heroSwiper, setHeroSwiper] = useState<SwiperType | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const openLightbox = useCallback(() => {
    if (heroSwiper) {
      setLightboxIndex(heroSwiper.realIndex);
    }
  }, [heroSwiper]);

  const closeLightbox = useCallback(() => {
    setLightboxIndex(null);
  }, []);

  useEffect(() => {
    if (lightboxIndex === null) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [lightboxIndex, closeLightbox]);

  // Prevent body scroll when lightbox is open
  useEffect(() => {
    if (lightboxIndex !== null) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [lightboxIndex]);

  return (
    <>
      <SectionWrapper id="gallery" className="text-center">
        <h2 className="text-lg font-light text-primary mb-8 tracking-wider">
          갤러리
        </h2>

        {/* Hero Carousel */}
        <div className="mb-5">
          <Swiper
            modules={[Autoplay, Pagination, EffectFade, Thumbs]}
            effect="fade"
            autoplay={{ delay: 4500, disableOnInteraction: false }}
            pagination={{ clickable: true }}
            thumbs={{
              swiper:
                thumbsSwiper && !thumbsSwiper.destroyed
                  ? thumbsSwiper
                  : null,
            }}
            onSwiper={setHeroSwiper}
            loop
            className="rounded-2xl overflow-hidden"
          >
            {gallery.images.map((image, index) => (
              <SwiperSlide key={index}>
                <div
                  className="relative aspect-[3/4] cursor-pointer bg-border/30"
                  onClick={openLightbox}
                >
                  <Image
                    src={image.src}
                    alt={image.alt}
                    fill
                    className="object-cover"
                    sizes="(max-width: 512px) 100vw, 400px"
                    loading={index === 0 ? "eager" : "lazy"}
                  />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        {/* Thumbnail Strip */}
        <Swiper
          modules={[FreeMode, Thumbs]}
          onSwiper={setThumbsSwiper}
          slidesPerView="auto"
          spaceBetween={6}
          freeMode
          watchSlidesProgress
          className="gallery-thumbs"
        >
          {gallery.images.map((image, index) => (
            <SwiperSlide
              key={index}
              className="!w-16 !h-16"
              style={{ width: "4rem", height: "4rem" }}
            >
              <div
                className="relative w-full h-full rounded overflow-hidden cursor-pointer bg-border/30"
              >
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  className="object-cover"
                  sizes="80px"
                  loading="lazy"
                />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </SectionWrapper>

      {/* Fullscreen Lightbox */}
      <AnimatePresence>
        {lightboxIndex !== null && (
          <motion.div
            className="fixed inset-0 z-50 bg-black"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.25 }}
          >
            {/* Header */}
            <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-4 pt-3 pb-10 bg-gradient-to-b from-black/50 to-transparent">
              <span className="text-white/70 text-sm">
                {lightboxIndex + 1} / {gallery.images.length}
              </span>
              <button
                onClick={closeLightbox}
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

            {/* Swiper with Zoom */}
            <Swiper
              modules={[Zoom, Keyboard]}
              zoom={{ maxRatio: 3 }}
              keyboard={{ enabled: true }}
              initialSlide={lightboxIndex}
              slidesPerView={1}
              loop
              className="w-full h-full"
              onSlideChange={(swiper) => setLightboxIndex(swiper.realIndex)}
            >
              {gallery.images.map((image, index) => (
                <SwiperSlide key={index}>
                  <div className="swiper-zoom-container">
                    <Image
                      src={image.src}
                      alt={image.alt}
                      fill
                      className="object-contain"
                      sizes="100vw"
                      priority={index === lightboxIndex}
                    />
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
