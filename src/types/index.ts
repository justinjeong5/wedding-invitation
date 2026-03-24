export interface GuestbookEntry {
  id: string;
  name: string;
  message: string;
  created_at: string;
}

export interface RsvpEntry {
  id: string;
  name: string;
  side: "groom" | "bride";
  attendance: boolean;
  guest_count: number;
  meal: boolean;
  message?: string;
  created_at: string;
}

export interface Account {
  bank: string;
  number: string;
  holder: string;
  relation?: string;
}

export interface GalleryImage {
  src: string;
  alt: string;
}
