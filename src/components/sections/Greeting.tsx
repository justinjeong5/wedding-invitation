import SectionWrapper from "@/components/ui/SectionWrapper";
import { WEDDING_CONFIG } from "@/config/wedding";

export default function Greeting() {
  const { greeting } = WEDDING_CONFIG;

  return (
    <SectionWrapper id="greeting" className="text-center">
      <h2 className="text-lg font-light text-primary mb-8 tracking-wider">
        {greeting.title}
      </h2>

      <div className="mx-auto w-8 h-px bg-primary/30 mb-8" />

      <p className="text-[15px] leading-8 text-text-light whitespace-pre-line font-serif font-light">
        {greeting.message}
      </p>

      <div className="mx-auto w-8 h-px bg-primary/30 mt-8" />
    </SectionWrapper>
  );
}
