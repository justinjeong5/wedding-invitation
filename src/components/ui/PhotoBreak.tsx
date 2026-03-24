"use client";

import { useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
} from "framer-motion";
import Image from "next/image";

interface PhotoBreakProps {
  src: string;
  alt: string;
  height?: string;
}

export default function PhotoBreak({
  src,
  alt,
  height = "55vh",
}: PhotoBreakProps) {
  const ref = useRef<HTMLDivElement>(null);
  const prefersReduced = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const y = useTransform(
    scrollYProgress,
    [0, 1],
    prefersReduced ? ["0%", "0%"] : ["-12%", "12%"]
  );

  return (
    <div ref={ref} className="relative w-full overflow-hidden" style={{ height }}>
      <motion.div className="absolute inset-0 scale-[1.25]" style={{ y }}>
        <Image
          src={src}
          alt={alt}
          fill
          className="object-cover"
          sizes="480px"
          loading="lazy"
        />
      </motion.div>
      <div className="absolute inset-0 bg-gradient-to-b from-bg/30 via-transparent to-bg/30 pointer-events-none" />
    </div>
  );
}
