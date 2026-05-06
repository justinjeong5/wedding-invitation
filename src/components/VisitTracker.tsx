"use client";

import { useEffect, useState } from "react";
import { recordVisit } from "@/actions/visit";

const VISITOR_ID_KEY = "wjw-visitor-id";

export function useVisitorId() {
  const [visitorId, setVisitorId] = useState("");
  useEffect(() => {
    let id = localStorage.getItem(VISITOR_ID_KEY);
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(VISITOR_ID_KEY, id);
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setVisitorId(id);
  }, []);
  return visitorId;
}

export default function VisitTracker() {
  const visitorId = useVisitorId();

  useEffect(() => {
    if (visitorId) recordVisit(visitorId);
  }, [visitorId]);

  return null;
}
