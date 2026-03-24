"use client";

import { useState } from "react";
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

  return (
    <>
      <SectionWrapper id="gallery" className="text-center">
        <h2 className="text-lg font-light text-primary mb-8 tracking-wider">
          갤러리
        </h2>

        <div className="mx-auto max-w-sm">
          <Swiper
            modules={[Autoplay, Pagination]}
            autoplay={{ delay: 3000, disableOnInteraction: false }}
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
      </SectionWrapper>

      {/* Lightbox */}
      <AnimatePresence>
        {selectedIndex !== null && (
          <motion.div
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedIndex(null)}
          >
            <button
              className="absolute top-4 right-4 text-white/70 text-3xl z-50 p-2"
              onClick={() => setSelectedIndex(null)}
            >
              &times;
            </button>
            <motion.div
              className="relative w-full h-full max-w-lg max-h-[80vh] mx-4"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={gallery.images[selectedIndex].src}
                alt={gallery.images[selectedIndex].alt}
                fill
                className="object-contain"
                sizes="100vw"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
