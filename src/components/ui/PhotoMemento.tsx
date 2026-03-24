"use client";

import { motion, useReducedMotion } from "framer-motion";
import Image from "next/image";

interface PhotoMementoProps {
  src: string;
  alt: string;
  caption?: string;
}

export default function PhotoMemento({
  src,
  alt,
  caption = "K · W  2026",
}: PhotoMementoProps) {
  const prefersReduced = useReducedMotion();

  return (
    <div className="w-full px-4 py-10">
      <motion.div
        className="relative w-full aspect-[4/5] overflow-hidden"
        initial={{
          clipPath: prefersReduced ? "inset(0 0% 0 0)" : "inset(0 100% 0 0)",
        }}
        whileInView={{ clipPath: "inset(0 0% 0 0)" }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.9, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        <Image
          src={src}
          alt={alt}
          fill
          className="object-cover"
          sizes="480px"
          loading="lazy"
        />
      </motion.div>

      <motion.div
        className="flex items-center justify-between mt-3 px-0.5"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: prefersReduced ? 0 : 0.6 }}
      >
        <div className="h-px w-10 bg-primary/40" />
        <span className="text-[11px] tracking-[0.25em] text-primary/60 font-light">
          {caption}
        </span>
      </motion.div>
    </div>
  );
}
