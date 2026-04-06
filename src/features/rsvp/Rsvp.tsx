"use client";

import { useState, useEffect, useCallback } from "react";
import { useAdminMode } from "@/hooks/useAdminMode";
import SectionWrapper from "@/components/ui/SectionWrapper";
import RsvpForm from "@/features/rsvp/RsvpForm";
import RsvpSummary from "@/features/rsvp/RsvpSummary";
import RsvpDashboard from "@/features/rsvp/RsvpDashboard";
import type { SavedRsvp } from "@/features/rsvp/types";

const STORAGE_KEY = "wedding_rsvp";

export default function Rsvp() {
  const [savedRsvp, setSavedRsvp] = useState<SavedRsvp | null>(null);
  const [editing, setEditing] = useState(false);
  const [editPassword, setEditPassword] = useState<string | null>(null);
  const [justSubmitted, setJustSubmitted] = useState(false);
  const [mounted, setMounted] = useState(false);

  const { isAdmin, adminPasswordRef } = useAdminMode();

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setSavedRsvp(JSON.parse(saved));
    } catch { /* 시크릿 모드 등 localStorage 미지원 — 무시 */ }
    setMounted(true);
  }, []);

  const handleSuccess = useCallback((data: SavedRsvp) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch { /* localStorage 미지원 — 무시 */ }
    setSavedRsvp(data);
    setEditing(false);
    setEditPassword(null);
    setJustSubmitted(true);
  }, []);

  const handleDelete = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch { /* localStorage 미지원 — 무시 */ }
    setSavedRsvp(null);
    setEditing(false);
    setEditPassword(null);
    setJustSubmitted(false);
  }, []);

  if (!mounted) {
    return (
      <SectionWrapper id="rsvp" className="text-center">
        <h2 className="text-lg font-light text-primary mb-2 tracking-wider">
          참석 여부
        </h2>
        <div className="h-64" />
      </SectionWrapper>
    );
  }

  return (
    <>
      {isAdmin && <RsvpDashboard adminPassword={adminPasswordRef.current} />}
      {savedRsvp && !editing ? (
        <RsvpSummary
          data={savedRsvp}
          justSubmitted={justSubmitted}
          onEdit={(password) => {
            setEditPassword(password);
            setEditing(true);
            setJustSubmitted(false);
          }}
          onDelete={handleDelete}
        />
      ) : (
        <RsvpForm
          initialValues={savedRsvp}
          editPassword={editPassword}
          onSuccess={handleSuccess}
          onCancel={() => {
            setEditing(false);
            setEditPassword(null);
          }}
        />
      )}
    </>
  );
}
