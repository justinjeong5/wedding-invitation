import SectionWrapper from "@/components/ui/SectionWrapper";
import { WEDDING_CONFIG } from "@/config/wedding";

function PhoneIcon({ size = "w-4 h-4" }: { size?: string }) {
  return (
    <svg className={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M6.62 10.79a15.05 15.05 0 006.59 6.59l2.2-2.2a1 1 0 011.01-.24c1.12.37 2.33.57 3.58.57a1 1 0 011 1V20a1 1 0 01-1 1A17 17 0 013 4a1 1 0 011-1h3.5a1 1 0 011 1c0 1.25.2 2.46.57 3.58a1 1 0 01-.25 1.01l-2.2 2.2z" />
    </svg>
  );
}

function SmsIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.17L4 17.17V4h16v12z" />
      <path d="M7 9h2v2H7zm4 0h2v2h-2zm4 0h2v2h-2z" />
    </svg>
  );
}

interface ContactPersonProps {
  name: string;
  tel: string;
  parents: { name: string; relation: string; tel: string }[];
}

function ContactPerson({ name, tel, parents }: ContactPersonProps) {
  return (
    <div className="flex flex-col items-center">
      <p className="text-sm font-medium text-text-light mb-3">{name}</p>
      <div className="flex gap-3 mb-4">
        <a
          href={`tel:${tel}`}
          className="flex flex-col items-center gap-1"
          aria-label={`${name}에게 전화`}
        >
          <span className="w-10 h-10 rounded-full flex items-center justify-center text-primary border border-primary/25 bg-white shadow-sm">
            <PhoneIcon />
          </span>
          <span className="text-[10px] text-text-muted">전화</span>
        </a>
        <a
          href={`sms:${tel}`}
          className="flex flex-col items-center gap-1"
          aria-label={`${name}에게 문자`}
        >
          <span className="w-10 h-10 rounded-full flex items-center justify-center text-primary border border-primary/25 bg-white shadow-sm">
            <SmsIcon />
          </span>
          <span className="text-[10px] text-text-muted">문자</span>
        </a>
      </div>
      <div className="w-full space-y-1.5">
        {parents.map((parent) => (
          <div key={parent.name} className="flex items-center justify-between">
            <span className="text-xs text-text-muted truncate">
              {parent.relation} {parent.name}
            </span>
            <a
              href={`tel:${parent.tel}`}
              className="ml-2 shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-primary/50 border border-primary/15 bg-white"
              aria-label={`${parent.name}에게 전화`}
            >
              <PhoneIcon size="w-3.5 h-3.5" />
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

      <div className="rounded-2xl border border-border bg-bg-card p-5">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col items-center">
            <p className="text-xs text-primary tracking-wider mb-3">신랑측</p>
            <ContactPerson
              name={groom.name}
              tel={groom.tel}
              parents={[
                { ...groom.father, tel: groom.fatherTel },
                { ...groom.mother, tel: groom.motherTel },
              ]}
            />
          </div>

          <div className="relative flex flex-col items-center">
            <div className="absolute left-0 top-0 bottom-0 w-px bg-border" />
            <p className="text-xs text-primary tracking-wider mb-3">신부측</p>
            <ContactPerson
              name={bride.name}
              tel={bride.tel}
              parents={[
                { ...bride.father, tel: bride.fatherTel },
                { ...bride.mother, tel: bride.motherTel },
              ]}
            />
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
}
