import dynamic from "next/dynamic";
import Cover from "@/components/sections/Cover";
import Greeting from "@/components/sections/Greeting";
import Couple from "@/components/sections/Couple";
import Divider from "@/components/ui/Divider";
import Calendar from "@/components/sections/Calendar";
import Gallery from "@/components/sections/Gallery";
import Location from "@/components/sections/Location";
import Contact from "@/components/sections/Contact";
import Account from "@/components/sections/Account";
import ThankYouGallery from "@/components/sections/ThankYouGallery";
import Footer from "@/components/sections/Footer";
import AccessibilityToggle from "@/components/ui/AccessibilityToggle";
import AdminIndicator from "@/components/ui/AdminIndicator";
import AdminDashboard from "@/components/ui/AdminDashboard";
import ShareFab from "@/components/ui/ShareFab";
import BgmPlayer from "@/components/ui/BgmPlayer";
import Toast from "@/components/ui/Toast";
import TopNav from "@/components/ui/TopNav";
import AfterWeddingHide from "@/components/ui/AfterWeddingHide";
import AfterWeddingShow from "@/components/ui/AfterWeddingShow";
import GuestGalleryGate from "@/components/ui/GuestGalleryGate";
import VisitTracker from "@/components/VisitTracker";

const Rsvp = dynamic(() => import("@/features/rsvp"));
const Guestbook = dynamic(() => import("@/features/guestbook"));
const GuestGallery = dynamic(() => import("@/features/guest-gallery"));

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
      <Cover />
      <AdminDashboard />
      <Greeting />
      <AfterWeddingShow>
        <ThankYouGallery />
      </AfterWeddingShow>
      <Couple />
      <AfterWeddingHide>
        <Divider />
        <Calendar />
      </AfterWeddingHide>
      <Divider />
      <Gallery />
      <AfterWeddingHide>
        <Divider />
        <Location />
      </AfterWeddingHide>
      <AfterWeddingHide>
        <Divider />
        <Rsvp />
      </AfterWeddingHide>
      <Divider />
      <Contact />
      <AfterWeddingHide>
        <Divider />
        <Account />
      </AfterWeddingHide>
      <GuestGalleryGate>
        <Divider />
        <GuestGallery />
      </GuestGalleryGate>
      <Divider />
      <Guestbook />
      <Footer />
    </main>
  );
}
