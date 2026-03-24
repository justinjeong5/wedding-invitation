"use client";

import { motion, useReducedMotion } from "framer-motion";
import Image from "next/image";

interface Photo {
  src: string;
  alt: string;
}

export default function PhotoRevealPair({
  left,
  right,
}: {
  left: Photo;
  right: Photo;
}) {
  const prefersReduced = useReducedMotion();

  const container = {
    hidden: {},
    visible: {
      transition: { staggerChildren: 0.15 },
    },
  };

  const leftItem = {
    hidden: {
      opacity: 0,
      x: prefersReduced ? 0 : -24,
      y: prefersReduced ? 0 : 16,
    },
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      transition: { duration: 0.7, ease: "easeOut" as const },
    },
  };

  const rightItem = {
    hidden: {
      opacity: 0,
      x: prefersReduced ? 0 : 24,
      y: prefersReduced ? 0 : 32,
    },
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      transition: { duration: 0.7, ease: "easeOut" as const },
    },
  };

  return (
    <motion.div
      className="relative w-full py-10 px-5"
      variants={container}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-60px" }}
    >
      <motion.div
        className="relative w-[58%] aspect-[3/4] rounded-2xl overflow-hidden shadow-lg"
        variants={leftItem}
      >
        <Image
          src={left.src}
          alt={left.alt}
          fill
          className="object-cover"
          sizes="280px"
          loading="lazy"
        />
      </motion.div>

      <motion.div
        className="relative w-[50%] aspect-[3/4] rounded-2xl overflow-hidden shadow-xl ml-auto -mt-20"
        variants={rightItem}
      >
        <Image
          src={right.src}
          alt={right.alt}
          fill
          className="object-cover"
          sizes="240px"
          loading="lazy"
        />
      </motion.div>
    </motion.div>
  );
}
