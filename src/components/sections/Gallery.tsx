"use client";

import { useState, useCallback } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import SectionWrapper from "@/components/ui/SectionWrapper";
import { WEDDING_CONFIG } from "@/config/wedding";

import "swiper/css";
import "swiper/css/pagination";

export default function Gallery() {
  const { gallery } = WEDDING_CONFIG;
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const goPrev = useCallback(() => {
    setSelectedIndex((prev) =>
      prev !== null ? (prev - 1 + gallery.images.length) % gallery.images.length : null
    );
  }, [gallery.images.length]);

  const goNext = useCallback(() => {
    setSelectedIndex((prev) =>
      prev !== null ? (prev + 1) % gallery.images.length : null
    );
  }, [gallery.images.length]);

  return (
    <>
      <SectionWrapper id="gallery" className="text-center">
        <h2 className="text-lg font-light text-primary mb-8 tracking-wider">
          갤러리
        </h2>

        {/* Swiper carousel */}
        <div className="mx-auto max-w-sm mb-6">
          <Swiper
            modules={[Autoplay, Pagination]}
            autoplay={{ delay: 3500, disableOnInteraction: false }}
            pagination={{ clickable: true }}
            loop
            className="rounded-lg overflow-hidden"
          >
            {gallery.images.map((image, index) => (
              <SwiperSlide key={index}>
                <div
                  className="relative aspect-[3/4] cursor-pointer"
                  onClick={() => setSelectedIndex(index)}
                >
                  <Image
                    src={image.src}
                    alt={image.alt}
                    fill
                    className="object-cover"
                    sizes="(max-width: 512px) 100vw, 400px"
                  />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        {/* Thumbnail grid */}
        <div className="grid grid-cols-4 gap-1.5 max-w-sm mx-auto">
          {gallery.images.map((image, index) => (
            <div
              key={index}
              className="relative aspect-square cursor-pointer rounded overflow-hidden"
              onClick={() => setSelectedIndex(index)}
            >
              <Image
                src={image.src}
                alt={image.alt}
                fill
                className="object-cover hover:scale-105 transition-transform duration-300"
                sizes="80px"
              />
            </div>
          ))}
        </div>
      </SectionWrapper>

      {/* Lightbox */}
      <AnimatePresence>
        {selectedIndex !== null && (
          <motion.div
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedIndex(null)}
          >
            {/* Close */}
            <button
              className="absolute top-4 right-4 text-white/70 text-4xl z-50 p-3 min-h-0"
              onClick={() => setSelectedIndex(null)}
              aria-label="닫기"
            >
              &times;
            </button>

            {/* Counter */}
            <div className="absolute top-5 left-1/2 -translate-x-1/2 text-white/60 text-sm font-sans z-50">
              {selectedIndex + 1} / {gallery.images.length}
            </div>

            {/* Prev */}
            <button
              className="absolute left-2 top-1/2 -translate-y-1/2 text-white/60 text-4xl p-3 z-50 min-h-0"
              onClick={(e) => {
                e.stopPropagation();
                goPrev();
              }}
              aria-label="이전 사진"
            >
              &#8249;
            </button>

            {/* Image */}
            <motion.div
              key={selectedIndex}
              className="relative w-full h-full max-w-lg max-h-[80vh] mx-12"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={gallery.images[selectedIndex].src}
                alt={gallery.images[selectedIndex].alt}
                fill
                className="object-contain"
                sizes="100vw"
                priority
              />
            </motion.div>

            {/* Next */}
            <button
              className="absolute right-2 top-1/2 -translate-y-1/2 text-white/60 text-4xl p-3 z-50 min-h-0"
              onClick={(e) => {
                e.stopPropagation();
                goNext();
              }}
              aria-label="다음 사진"
            >
              &#8250;
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
