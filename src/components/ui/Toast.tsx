"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ToastMessage {
  id: number;
  text: string;
}

let toastId = 0;

export function showToast(text: string) {
  window.dispatchEvent(new CustomEvent("app-toast", { detail: text }));
}

export default function Toast() {
  const [messages, setMessages] = useState<ToastMessage[]>([]);

  const addMessage = useCallback((text: string) => {
    const id = ++toastId;
    setMessages((prev) => [...prev.filter((m) => m.id !== id), { id, text }]);
    setTimeout(() => {
      setMessages((prev) => prev.filter((m) => m.id !== id));
    }, 2000);
  }, []);

  useEffect(() => {
    const handler = (e: Event) => {
      addMessage((e as CustomEvent).detail);
    };
    window.addEventListener("app-toast", handler);
    return () => window.removeEventListener("app-toast", handler);
  }, [addMessage]);

  return (
    <div className="fixed bottom-24 left-0 right-0 z-[9999] flex flex-col items-center gap-2 pointer-events-none">
      <AnimatePresence>
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="px-5 py-3 rounded-full bg-black/75 text-white text-sm shadow-lg backdrop-blur-sm"
          >
            {msg.text}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
