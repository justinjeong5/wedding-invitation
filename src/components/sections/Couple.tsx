import SectionWrapper from "@/components/ui/SectionWrapper";
import { WEDDING_CONFIG } from "@/config/wedding";

export default function Couple() {
  const { groom, bride } = WEDDING_CONFIG;

  return (
    <SectionWrapper id="couple" className="text-center">
      <div className="flex items-center justify-center gap-6 text-sm font-serif font-light">
        <div className="flex-1 text-right">
          <p className="text-text-muted text-xs mb-1">
            {groom.father.name} · {groom.mother.name}
            <span className="text-text-muted/80 ml-1">의 아들</span>
          </p>
          <p className="text-lg font-normal text-text">{groom.name}</p>
        </div>

        <div className="text-primary text-2xl font-light select-none">&amp;</div>

        <div className="flex-1 text-left">
          <p className="text-text-muted text-xs mb-1">
            {bride.father.name} · {bride.mother.name}
            <span className="text-text-muted/80 ml-1">의 딸</span>
          </p>
          <p className="text-lg font-normal text-text">{bride.name}</p>
        </div>
      </div>
    </SectionWrapper>
  );
}
