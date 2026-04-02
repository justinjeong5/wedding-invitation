"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import SectionWrapper from "@/components/ui/SectionWrapper";
import { WEDDING_CONFIG } from "@/config/wedding";

export default function ThankYouGallery() {
  const { photos, photoCaption } = WEDDING_CONFIG.afterWedding;

  return (
    <SectionWrapper className="text-center">
      <div className="flex gap-3 max-w-sm mx-auto">
        {photos.map((photo, i) => (
          <motion.div
            key={photo.src}
            className="flex-1 overflow-hidden rounded-xl"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: i * 0.15 }}
          >
            <Image
              src={photo.src}
              alt={photo.alt}
              width={photo.width}
              height={photo.height}
              className="w-full h-auto object-cover"
              sizes="45vw"
            />
          </motion.div>
        ))}
      </div>
      {photoCaption && (
        <p className="text-xs text-text-muted/70 font-serif font-light mt-6 tracking-wider">
          {photoCaption}
        </p>
      )}
    </SectionWrapper>
  );
}
