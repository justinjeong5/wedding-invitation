"use client";

import { useState } from "react";
import SectionWrapper from "@/components/ui/SectionWrapper";
import CopyButton from "@/components/ui/CopyButton";
import { copyToClipboard } from "@/lib/clipboard";
import { WEDDING_CONFIG } from "@/config/wedding";
import type { Account as AccountType } from "@/types";

function KakaopayIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
      <path d="M12 3C6.48 3 2 6.58 2 10.94c0 2.8 1.86 5.27 4.66 6.67l-.9 3.33c-.08.28.24.52.49.36l3.87-2.57c.6.08 1.23.13 1.88.13 5.52 0 10-3.58 10-7.92S17.52 3 12 3z" />
    </svg>
  );
}

function TossIcon() {
  return (
    <span className="text-[10px] font-bold leading-none">T</span>
  );
}

function AccountCard({ account }: { account: AccountType }) {
  const hasPayLinks = !!(account.kakaopayUrl || account.tossUrl);
  const hasAccount = !!(account.bank && account.number);
  const [showAccount, setShowAccount] = useState(false);

  return (
    <div className="rounded-xl border border-border/50 p-4 bg-bg-card">
      <div className="flex items-center gap-1.5 mb-3">
        <p className="text-sm font-medium text-text-light">{account.holder}</p>
        {account.relation && (
          <span
            className="text-[10px] text-primary/70 border border-primary/20 rounded px-1 py-0.5 leading-none"
            style={{ minHeight: "auto" }}
          >
            {account.relation}
          </span>
        )}
      </div>

      {hasPayLinks && (
        <div className="flex gap-2 mb-2">
          {account.kakaopayUrl && (
            <button
              onClick={() => window.open(account.kakaopayUrl, "_blank")}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-medium text-black/85 transition-opacity hover:opacity-80"
              style={{ backgroundColor: "#FEE500", minHeight: "auto" }}
            >
              <KakaopayIcon />
              카카오페이
            </button>
          )}
          {account.tossUrl && (
            <button
              onClick={() => window.open(account.tossUrl, "_blank")}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-medium text-white transition-opacity hover:opacity-80"
              style={{ backgroundColor: "#0064FF", minHeight: "auto" }}
            >
              <TossIcon />
              토스
            </button>
          )}
        </div>
      )}

      {hasAccount && hasPayLinks && (
        <button
          onClick={() => setShowAccount(!showAccount)}
          className="w-full text-[11px] text-text-muted/60 text-center pt-1 transition-colors hover:text-text-muted"
          style={{ minHeight: "auto" }}
        >
          계좌번호 {showAccount ? "접기" : "보기"}
        </button>
      )}

      {hasAccount && (!hasPayLinks || showAccount) && (
        <div className="flex items-center justify-between gap-3 pt-1">
          <button
            onClick={() => copyToClipboard(`${account.bank} ${account.number}`)}
            className="text-xs text-text-muted font-mono tracking-wide no-underline"
            style={{ minHeight: "auto", textDecoration: "none", WebkitTapHighlightColor: "transparent" }}
          >
            {account.bank} {account.number}
          </button>
          <CopyButton text={`${account.bank} ${account.number} ${account.holder}`} />
        </div>
      )}
    </div>
  );
}

function AccountGroup({
  label,
  accounts,
}: {
  label: string;
  accounts: readonly AccountType[];
}) {
  return (
    <div>
      <p className="text-xs text-primary tracking-wider text-left mb-2.5">
        {label}
      </p>
      <div className="space-y-2.5">
        {accounts.map((account) => (
          <AccountCard
            key={`${account.bank}-${account.holder}`}
            account={account}
          />
        ))}
      </div>
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

      <div className="space-y-6">
        <AccountGroup label="신랑측" accounts={groom.accounts} />
        <AccountGroup label="신부측" accounts={bride.accounts} />
      </div>
    </SectionWrapper>
  );
}
