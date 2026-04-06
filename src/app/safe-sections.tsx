"use client";

import dynamic from "next/dynamic";
import { withErrorBoundary } from "@/components/ui/SectionErrorBoundary";
import Cover from "@/components/sections/Cover";
import Greeting from "@/components/sections/Greeting";
import Couple from "@/components/sections/Couple";
import Calendar from "@/components/sections/Calendar";
import Gallery from "@/components/sections/Gallery";
import Location from "@/components/sections/Location";
import Contact from "@/components/sections/Contact";
import Account from "@/components/sections/Account";
import ThankYouGallery from "@/components/sections/ThankYouGallery";
import AdminDashboard from "@/components/ui/AdminDashboard";

export const SafeCover = withErrorBoundary(Cover, "Cover");
export const SafeGreeting = withErrorBoundary(Greeting, "Greeting");
export const SafeCouple = withErrorBoundary(Couple, "Couple");
export const SafeCalendar = withErrorBoundary(Calendar, "Calendar");
export const SafeGallery = withErrorBoundary(Gallery, "Gallery");
export const SafeLocation = withErrorBoundary(Location, "Location");
export const SafeContact = withErrorBoundary(Contact, "Contact");
export const SafeAccount = withErrorBoundary(Account, "Account");
export const SafeThankYouGallery = withErrorBoundary(ThankYouGallery, "ThankYouGallery");
export const SafeAdminDashboard = withErrorBoundary(AdminDashboard, "AdminDashboard");

export const SafeRsvp = withErrorBoundary(
  dynamic(() => import("@/features/rsvp")),
  "Rsvp",
);
export const SafeGuestbook = withErrorBoundary(
  dynamic(() => import("@/features/guestbook")),
  "Guestbook",
);
export const SafeGuestGallery = withErrorBoundary(
  dynamic(() => import("@/features/guest-gallery")),
  "GuestGallery",
);
