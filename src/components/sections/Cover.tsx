"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { WEDDING_CONFIG } from "@/config/wedding";
import { useAfterWedding } from "@/hooks/useAfterWedding";

const PETALS = [
  { size: 8, left: 12, delay: 0, duration: 6, swayAmp: 20, opacity: 0.4 },
  { size: 6, left: 28, delay: 1.2, duration: 8, swayAmp: 15, opacity: 0.3 },
  { size: 10, left: 45, delay: 0.5, duration: 7, swayAmp: 25, opacity: 0.5 },
  { size: 7, left: 62, delay: 2, duration: 6.5, swayAmp: 18, opacity: 0.35 },
  { size: 12, left: 78, delay: 0.8, duration: 9, swayAmp: 22, opacity: 0.45 },
  { size: 9, left: 88, delay: 1.5, duration: 7.5, swayAmp: 16, opacity: 0.6 },
  { size: 6, left: 35, delay: 3, duration: 8.5, swayAmp: 20, opacity: 0.3 },
] as const;

const petalKeyframes = `
@keyframes petalFall {
  0% { transform: translateY(-10px) translateX(0) rotate(0deg); }
  25% { transform: translateY(25vh) translateX(var(--sway)) rotate(90deg); }
  50% { transform: translateY(50vh) translateX(calc(var(--sway) * -0.5)) rotate(180deg); }
  75% { transform: translateY(75vh) translateX(var(--sway)) rotate(270deg); }
  100% { transform: translateY(105vh) translateX(0) rotate(360deg); }
}
`;

export default function Cover() {
  const { groom, bride, date, venue, afterWedding: afterWeddingConfig } =
    WEDDING_CONFIG;
  const afterWedding = useAfterWedding();

  return (
    <section className="relative h-dvh flex flex-col items-center justify-center overflow-hidden bg-primary-dark">
      <style dangerouslySetInnerHTML={{ __html: petalKeyframes }} />

      <Image
        src="/images/cover.jpg"
        alt="웨딩 커버"
        fill
        className="object-cover"
        priority
      />

      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/10 to-black/40 z-10" />

      {/* Petals — z-[15] between gradient(z-10) and text(z-20) */}
      <div className="absolute inset-0 z-[15] pointer-events-none overflow-hidden">
        {PETALS.map((petal, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white/30"
            style={{
              width: petal.size,
              height: petal.size * 1.3,
              left: `${petal.left}%`,
              top: -petal.size * 2,
              opacity: petal.opacity,
              ["--sway" as string]: `${petal.swayAmp}px`,
              animation: `petalFall ${petal.duration}s ${petal.delay}s ease-in-out infinite`,
            }}
          />
        ))}
      </div>

      <div className="relative z-20 text-center text-white">
        <motion.p
          className="text-sm tracking-[0.3em] mb-6 font-light"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          {afterWedding ? afterWeddingConfig.coverText : "WEDDING INVITATION"}
        </motion.p>

        <motion.h1
          className="text-3xl font-serif font-light tracking-wide mb-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          {groom.name}
          <span className="mx-3 text-accent text-lg">&amp;</span>
          {bride.name}
        </motion.h1>

        <motion.p
          className="text-sm font-light tracking-wider mt-6 opacity-90"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.9 }}
        >
          {date.display}
        </motion.p>

        <motion.p
          className="text-xs font-light tracking-wider mt-2 opacity-75"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.2 }}
        >
          {venue.name} {venue.hall}
        </motion.p>
      </div>

      <motion.div
        className="absolute bottom-8 z-20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
      >
        <motion.div
          className="w-5 h-8 border-2 border-white/50 rounded-full flex justify-center pt-1.5"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <div className="w-1 h-1.5 bg-white/70 rounded-full" />
        </motion.div>
      </motion.div>
    </section>
  );
}
