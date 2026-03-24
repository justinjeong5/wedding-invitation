"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SectionWrapper from "@/components/ui/SectionWrapper";
import CopyButton from "@/components/ui/CopyButton";
import { WEDDING_CONFIG } from "@/config/wedding";
import type { Account as AccountType } from "@/types";

function AccountList({
  accounts,
  side,
}: {
  accounts: readonly AccountType[];
  side: string;
}) {
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
            <div className="px-5 pb-4 space-y-3">
              {accounts.map((account) => (
                <div
                  key={`${account.bank}-${account.holder}`}
                  className="flex items-start justify-between gap-3 rounded-lg p-3 bg-bg-card border border-border/50"
                >
                  <div className="text-left min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <p className="text-sm font-medium">{account.holder}</p>
                      {account.relation && (
                        <span
                          className="text-[10px] text-primary/70 border border-primary/20 rounded px-1 py-0.5 leading-none"
                          style={{ minHeight: "auto" }}
                        >
                          {account.relation}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-text-muted">{account.bank}</p>
                    <p className="text-xs text-text-light mt-0.5 tracking-wide font-mono">
                      {account.number}
                    </p>
                  </div>
                  <CopyButton text={`${account.bank} ${account.number} ${account.holder}`} />
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Account() {
  const { groom, bride } = WEDDING_CONFIG;

  return (
    <SectionWrapper id="account" className="text-center">
      <h2 className="text-lg font-light text-primary mb-2 tracking-wider">
        마음 전하실 곳
      </h2>
      <div className="mt-2.5 mb-8 mx-auto w-12 h-px bg-primary/40" />

      <div className="border border-border rounded-2xl overflow-hidden divide-y divide-border bg-bg-card">
        <AccountList accounts={groom.accounts} side="신랑측" />
        <AccountList accounts={bride.accounts} side="신부측" />
      </div>
    </SectionWrapper>
  );
}
