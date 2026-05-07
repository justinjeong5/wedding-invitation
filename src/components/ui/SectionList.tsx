"use client";

import { Fragment } from "react";
import { useAfterWedding } from "@/hooks/useAfterWedding";
import { useGuestGalleryOpen } from "@/hooks/useGuestGalleryOpen";
import Divider from "./Divider";

export type SectionVisibility =
  | "always"
  | "before-wedding"
  | "after-wedding"
  | "guest-gallery-open";

export interface SectionEntry {
  key: string;
  component: React.ReactNode;
  showWhen?: SectionVisibility;
}

export default function SectionList({ sections }: { sections: SectionEntry[] }) {
  const afterWedding = useAfterWedding();
  const guestGalleryOpen = useGuestGalleryOpen();

  const visible = sections.filter(({ showWhen = "always" }) => {
    switch (showWhen) {
      case "always": return true;
      case "before-wedding": return !afterWedding;
      case "after-wedding": return afterWedding;
      case "guest-gallery-open": return guestGalleryOpen;
    }
  });

  return (
    <>
      {visible.map(({ key, component }) => (
        <Fragment key={key}>
          <Divider />
          {component}
        </Fragment>
      ))}
    </>
  );
}
