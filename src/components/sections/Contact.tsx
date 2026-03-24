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
    <div className="px-5 py-5 text-center">
      <p className="text-xs text-primary font-semibold tracking-[0.12em] mb-3">{role}</p>
      <p className="text-lg font-medium mb-3">{name}</p>
      <div className="flex gap-2 justify-center mb-4">
        <a
          href={`tel:${tel}`}
          className="inline-flex items-center justify-center text-primary text-sm border border-primary/30 rounded-full px-5 py-2"
        >
          전화
        </a>
        <a
          href={`sms:${tel}`}
          className="inline-flex items-center justify-center text-primary text-sm border border-primary/30 rounded-full px-5 py-2"
        >
          문자
        </a>
      </div>
      <div className="space-y-2">
        {parents.map((parent) => (
          <div key={parent.name} className="flex items-center justify-center gap-3">
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

      <div className="border border-border rounded-2xl overflow-hidden divide-y divide-border bg-bg-card">
        <ContactCard
          role="신랑측"
          name={groom.name}
          tel={groom.tel}
          parents={[
            { ...groom.father, tel: groom.fatherTel },
            { ...groom.mother, tel: groom.motherTel },
          ]}
        />
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
