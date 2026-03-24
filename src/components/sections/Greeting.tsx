import SectionWrapper from "@/components/ui/SectionWrapper";
import { WEDDING_CONFIG } from "@/config/wedding";

export default function Greeting() {
  const { greeting } = WEDDING_CONFIG;

  return (
    <SectionWrapper id="greeting" className="text-center">
      <h2 className="text-lg font-light text-primary mb-8 tracking-wider">
        {greeting.title}
      </h2>
      <p className="text-sm leading-8 text-text-light whitespace-pre-line font-light">
        {greeting.message}
      </p>
    </SectionWrapper>
  );
}
