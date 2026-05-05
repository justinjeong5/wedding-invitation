"use client";

import SectionWrapper from "@/components/ui/SectionWrapper";
import { WEDDING_CONFIG } from "@/config/wedding";
import { useAfterWedding } from "@/hooks/useAfterWedding";

export default function Greeting() {
  const greeting = useAfterWedding()
    ? WEDDING_CONFIG.afterWedding.greeting
    : WEDDING_CONFIG.greeting;

  return (
    <SectionWrapper id="greeting" className="text-center">
      <h2 className="text-lg font-light text-primary mb-8 tracking-wider">
        {greeting.title}
      </h2>

      <div className="mx-auto w-8 h-px bg-primary/30 mb-8" />

      <p className="text-[15px] leading-8 text-text-light whitespace-pre-line font-serif font-light dark:font-normal">
        {greeting.message}
      </p>

      <div className="mx-auto w-8 h-px bg-primary/30 mt-8" />
    </SectionWrapper>
  );
}
