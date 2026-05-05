"use client";

import { useState, useEffect, useRef } from "react";

export function useAdminMode() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");
  const adminPasswordRef = useRef("");

  useEffect(() => {
    const handleAdmin = (e: Event) => {
      const { password } = (e as CustomEvent).detail;
      adminPasswordRef.current = password;
      setAdminPassword(password);
      setIsAdmin(true);
    };
    window.addEventListener("admin-activated", handleAdmin);
    return () => window.removeEventListener("admin-activated", handleAdmin);
  }, []);

  return { isAdmin, adminPassword, adminPasswordRef };
}
