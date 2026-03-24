"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SectionWrapper from "@/components/ui/SectionWrapper";
import { WEDDING_CONFIG } from "@/config/wedding";

interface ContactSideProps {
  side: string;
  name: string;
  tel: string;
  parents: { name: string; relation: string; tel: string }[];
}

function ContactSide({ side, name, tel, parents }: ContactSideProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-5 py-4 text-sm font-medium text-text-light tracking-[0.08em]"
        style={{ minHeight: "auto" }}
      >
        <span>{side}</span>
        <svg
          className={`w-4 h-4 text-primary/50 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 text-center">
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
          </motion.div>
        )}
      </AnimatePresence>
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
        <ContactSide
          side="신랑측"
          name={groom.name}
          tel={groom.tel}
          parents={[
            { ...groom.father, tel: groom.fatherTel },
            { ...groom.mother, tel: groom.motherTel },
          ]}
        />
        <ContactSide
          side="신부측"
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
