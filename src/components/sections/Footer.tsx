import { WEDDING_CONFIG } from "@/config/wedding";

export default function Footer() {
  const { groom, bride } = WEDDING_CONFIG;

  return (
    <footer className="py-12 px-5 text-center">
      <p className="text-xs text-text-muted">
        {groom.name} & {bride.name}
      </p>
    </footer>
  );
}
