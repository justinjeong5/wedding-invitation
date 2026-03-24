"use client";

import { useState } from "react";
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
    <div className="flex-1">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-3 text-sm border border-primary/30 rounded-lg text-primary hover:bg-primary/5 transition-colors font-sans"
      >
        {side} 계좌번호
        <span className="ml-2 text-xs">{isOpen ? "▲" : "▼"}</span>
      </button>

      {isOpen && (
        <div className="mt-3 space-y-3">
          {accounts.map((account) => (
            <div
              key={`${account.bank}-${account.holder}`}
              className="bg-bg-card p-3 rounded-lg border border-border"
            >
              <div className="flex items-center justify-between">
                <div className="text-left">
                  <p className="text-xs text-text-muted font-sans">
                    {account.bank}
                    {account.relation && (
                      <span className="ml-1 text-text-muted/60">
                        ({account.relation})
                      </span>
                    )}
                  </p>
                  <p className="text-sm font-sans mt-0.5">
                    {account.number}
                  </p>
                  <p className="text-xs text-text-light font-sans mt-0.5">
                    {account.holder}
                  </p>
                </div>
                <CopyButton text={`${account.bank} ${account.number} ${account.holder}`} />
              </div>
            </div>
          ))}
        </div>
      )}
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
      <p className="text-xs text-text-muted font-light mb-8">
        축하의 마음을 전해주세요
      </p>

      <div className="flex flex-col gap-3 min-[360px]:flex-row">
        <AccountList accounts={groom.accounts} side="신랑측" />
        <AccountList accounts={bride.accounts} side="신부측" />
      </div>
    </SectionWrapper>
  );
}
