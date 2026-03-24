import Cover from "@/components/sections/Cover";
import Greeting from "@/components/sections/Greeting";
import Couple from "@/components/sections/Couple";
import Divider from "@/components/ui/Divider";
import Calendar from "@/components/sections/Calendar";
import Gallery from "@/components/sections/Gallery";
import Location from "@/components/sections/Location";
import Contact from "@/components/sections/Contact";
import Account from "@/components/sections/Account";
import Rsvp from "@/components/sections/Rsvp";
import Share from "@/components/sections/Share";
import Guestbook from "@/components/sections/Guestbook";
import Footer from "@/components/sections/Footer";
import AccessibilityToggle from "@/components/ui/AccessibilityToggle";
import PhotoRevealPair from "@/components/ui/PhotoRevealPair";
import PhotoBreak from "@/components/ui/PhotoBreak";
import { WEDDING_CONFIG } from "@/config/wedding";

export default function Home() {
  const { featured } = WEDDING_CONFIG.gallery;

  return (
    <main className="min-h-dvh bg-bg w-full max-w-[480px] mx-auto overflow-x-hidden" data-1p-ignore>
      <AccessibilityToggle />
      <Cover />
      <Greeting />
      <Couple />
      <PhotoRevealPair left={featured[0]} right={featured[1]} />
      <Divider />
      <Calendar />
      <PhotoBreak src={featured[2].src} alt={featured[2].alt} height="50vh" />
      <Divider />
      <Gallery />
      <Divider />
      <Location />
      <Divider />
      <Rsvp />
      <Divider />
      <Contact />
      <Divider />
      <Account />
      <Divider />
      <Share />
      <Divider />
      <Guestbook />
      <Footer />
    </main>
  );
}
