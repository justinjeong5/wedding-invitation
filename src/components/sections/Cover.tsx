"use client";

import { motion } from "framer-motion";
import { WEDDING_CONFIG } from "@/config/wedding";

export default function Cover() {
  const { groom, bride, date } = WEDDING_CONFIG;

  return (
    <section className="relative h-dvh flex flex-col items-center justify-center overflow-hidden bg-primary-dark">
      {/* Background image placeholder */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/10 to-black/40 z-10" />
      <div className="absolute inset-0 bg-[url('/images/cover.svg')] bg-cover bg-center" />

      <div className="relative z-20 text-center text-white">
        <motion.p
          className="text-sm tracking-[0.3em] mb-6 font-sans font-light"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          WEDDING INVITATION
        </motion.p>

        <motion.h1
          className="text-3xl font-light tracking-wide mb-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          {groom.name}
          <span className="mx-3 text-accent text-lg">&amp;</span>
          {bride.name}
        </motion.h1>

        <motion.p
          className="text-sm font-sans font-light tracking-wider mt-6 opacity-90"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.9 }}
        >
          {date.display}
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
