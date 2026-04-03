import SectionWrapper from "@/components/ui/SectionWrapper";
import { WEDDING_CONFIG } from "@/config/wedding";

function PhoneIcon({ size = "w-4 h-4" }: { size?: string }) {
  return (
    <svg className={size} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
    </svg>
  );
}

function SmsIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
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
      <p className="text-sm font-medium text-text-light mb-2">{name}</p>
      <div className="flex gap-2 mb-3">
        <a
          href={`tel:${tel}`}
          className="w-8 h-8 rounded-full flex items-center justify-center text-primary bg-primary/10"
          aria-label={`${name}에게 전화`}
        >
          <PhoneIcon />
        </a>
        <a
          href={`sms:${tel}`}
          className="w-8 h-8 rounded-full flex items-center justify-center text-primary bg-primary/10"
          aria-label={`${name}에게 문자`}
        >
          <SmsIcon />
        </a>
      </div>
      <div className="w-full space-y-1">
        {parents.map((parent) => (
          <div key={parent.name} className="flex items-center justify-between py-1">
            <span className="text-xs text-text-muted truncate">
              {parent.relation} {parent.name}
            </span>
            <a
              href={`tel:${parent.tel}`}
              className="ml-2 shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-primary/60 bg-primary/5"
              aria-label={`${parent.name}에게 전화`}
            >
              <PhoneIcon size="w-3 h-3" />
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
