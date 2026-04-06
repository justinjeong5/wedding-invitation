import Divider from "@/components/ui/Divider";
import Footer from "@/components/sections/Footer";
import AccessibilityToggle from "@/components/ui/AccessibilityToggle";
import AdminIndicator from "@/components/ui/AdminIndicator";
import ShareFab from "@/components/ui/ShareFab";
import BgmPlayer from "@/components/ui/BgmPlayer";
import Toast from "@/components/ui/Toast";
import TopNav from "@/components/ui/TopNav";
import AfterWeddingHide from "@/components/ui/AfterWeddingHide";
import AfterWeddingShow from "@/components/ui/AfterWeddingShow";
import GuestGalleryGate from "@/components/ui/GuestGalleryGate";
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
      <AfterWeddingHide>
        <Divider />
        <SafeCalendar />
      </AfterWeddingHide>
      <Divider />
      <SafeGallery />
      <AfterWeddingHide>
        <Divider />
        <SafeLocation />
      </AfterWeddingHide>
      <AfterWeddingHide>
        <Divider />
        <SafeRsvp />
      </AfterWeddingHide>
      <Divider />
      <SafeContact />
      <AfterWeddingHide>
        <Divider />
        <SafeAccount />
      </AfterWeddingHide>
      <GuestGalleryGate>
        <Divider />
        <SafeGuestGallery />
      </GuestGalleryGate>
      <Divider />
      <SafeGuestbook />
      <Footer />
    </main>
  );
}
