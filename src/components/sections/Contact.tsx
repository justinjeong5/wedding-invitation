import SectionWrapper from "@/components/ui/SectionWrapper";
import { WEDDING_CONFIG } from "@/config/wedding";

interface ContactCardProps {
  role: string;
  name: string;
  tel: string;
  parents: { name: string; relation: string; tel: string }[];
}

function ContactCard({ role, name, tel, parents }: ContactCardProps) {
  return (
    <div className="flex-1">
      <p className="text-sm text-text-muted mb-3 font-medium">{role}</p>
      <div className="flex flex-col items-center gap-2 mb-4">
        <span className="text-base font-normal">{name}</span>
        <div className="flex gap-2">
          <a
            href={`tel:${tel}`}
            className="inline-flex items-center justify-center text-primary text-sm border border-primary/30 rounded-full px-4 py-2"
          >
            전화
          </a>
          <a
            href={`sms:${tel}`}
            className="inline-flex items-center justify-center text-primary text-sm border border-primary/30 rounded-full px-4 py-2"
          >
            문자
          </a>
        </div>
      </div>
      {parents.map((parent) => (
        <div key={parent.name} className="flex items-center justify-center gap-3 mb-2.5">
          <span className="text-sm text-text-light">
            {parent.relation} {parent.name}
          </span>
          <a
            href={`tel:${parent.tel}`}
            className="inline-flex items-center justify-center text-primary/70 text-xs border border-primary/20 rounded-full px-3 py-1.5"
          >
            전화
          </a>
        </div>
      ))}
    </div>
  );
}

export default function Contact() {
  const { groom, bride } = WEDDING_CONFIG;

  return (
    <SectionWrapper id="contact" className="text-center">
      <h2 className="text-lg font-light text-primary mb-8 tracking-wider">
        연락처
      </h2>

      <div className="flex gap-6 font-sans">
        <ContactCard
          role="신랑측"
          name={groom.name}
          tel={groom.tel}
          parents={[
            { ...groom.father, tel: groom.fatherTel },
            { ...groom.mother, tel: groom.motherTel },
          ]}
        />
        <div className="w-px bg-border" />
        <ContactCard
          role="신부측"
          name={bride.name}
          tel={bride.tel}
          parents={[
            { ...bride.father, tel: bride.fatherTel },
            { ...bride.mother, tel: bride.motherTel },
          ]}
        />
      </div>
    </SectionWrapper>
  );
}
