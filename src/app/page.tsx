import Footer from "@/components/sections/Footer";
import AccessibilityToggle from "@/components/ui/AccessibilityToggle";
import AdminIndicator from "@/components/ui/AdminIndicator";
import ShareFab from "@/components/ui/ShareFab";
import BgmPlayer from "@/components/ui/BgmPlayer";
import Toast from "@/components/ui/Toast";
import TopNav from "@/components/ui/TopNav";
import AfterWeddingShow from "@/components/ui/AfterWeddingShow";
import SectionList from "@/components/ui/SectionList";
import type { SectionEntry } from "@/components/ui/SectionList";
import VisitTracker from "@/components/VisitTracker";
import {
  SafeCover,
  SafeAdminDashboard,
  SafeGreeting,
  SafeThankYouGallery,
  SafeCouple,
  SafeCalendar,
  SafeGallery,
  SafeLocation,
  SafeRsvp,
  SafeContact,
  SafeAccount,
  SafeGuestGallery,
  SafeGuestbook,
} from "./safe-sections";

const SECTIONS: SectionEntry[] = [
  { key: "calendar", component: <SafeCalendar />, showWhen: "before-wedding" },
  { key: "gallery", component: <SafeGallery />, showWhen: "before-wedding" },
  { key: "location", component: <SafeLocation />, showWhen: "before-wedding" },
  { key: "rsvp", component: <SafeRsvp />, showWhen: "before-wedding" },
  { key: "contact", component: <SafeContact /> },
  { key: "account", component: <SafeAccount />, showWhen: "before-wedding" },
  { key: "guest-gallery", component: <SafeGuestGallery />, showWhen: "guest-gallery-open" },
  { key: "guestbook", component: <SafeGuestbook /> },
];

export default function Home() {
  return (
    <main className="min-h-dvh bg-bg w-full max-w-[480px] mx-auto overflow-x-hidden" data-1p-ignore>
      <VisitTracker />
      <TopNav />
      <AccessibilityToggle />
      <AdminIndicator />
      <ShareFab />
      <BgmPlayer />
      <Toast />
      <SafeCover />
      <SafeAdminDashboard />
      <SafeGreeting />
      <AfterWeddingShow>
        <SafeThankYouGallery />
      </AfterWeddingShow>
      <SafeCouple />
      <SectionList sections={SECTIONS} />
      <Footer />
    </main>
  );
}
