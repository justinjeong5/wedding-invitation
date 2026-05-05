import SectionWrapper from "@/components/ui/SectionWrapper";
import { WEDDING_CONFIG } from "@/config/wedding";

export default function Couple() {
  const { groom, bride } = WEDDING_CONFIG;

  return (
    <SectionWrapper id="couple" className="text-center">
      <div className="flex items-center justify-center gap-6 font-serif">
        {/* Groom */}
        <div className="flex-1 text-right">
          <p className="text-xs text-text-muted mb-2">
            {groom.father.name} · {groom.mother.name}
            <span className="text-text-muted/80 ml-1">의 장남</span>
          </p>
          <p className="text-xl font-normal text-text tracking-wide">{groom.name}</p>
        </div>

        <div className="flex flex-col items-center gap-3">
          <div className="w-px h-6 bg-primary/30" />
          <span className="text-primary text-lg font-light select-none">&amp;</span>
          <div className="w-px h-6 bg-primary/30" />
        </div>

        {/* Bride */}
        <div className="flex-1 text-left">
          <p className="text-xs text-text-muted mb-2">
            {bride.father.name} · {bride.mother.name}
            <span className="text-text-muted/80 ml-1">의 장녀</span>
          </p>
          <p className="text-xl font-normal text-text tracking-wide">{bride.name}</p>
        </div>
      </div>
    </SectionWrapper>
  );
}
