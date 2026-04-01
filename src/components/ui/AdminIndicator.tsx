"use client";

import { useState, useEffect } from "react";

export default function AdminIndicator() {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const handleAdmin = () => setIsAdmin(true);
    window.addEventListener("admin-activated", handleAdmin);
    return () => window.removeEventListener("admin-activated", handleAdmin);
  }, []);

  if (!isAdmin) return null;

  return (
    <>
      {/* Viewport border */}
      <div
        className="fixed inset-0 z-40 pointer-events-none"
        style={{ boxShadow: "inset 0 0 0 2px rgba(234, 138, 46, 0.5)" }}
      />
      {/* Top label */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 z-40 pointer-events-none">
        <span className="inline-block px-3 py-0.5 text-[10px] text-white bg-orange-400/80 rounded-b-md tracking-wider">
          관리자 모드
        </span>
      </div>
    </>
  );
}
