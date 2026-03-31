export interface FormState {
  success: boolean;
  error?: string;
}

export interface GuestbookEntry {
  id: string;
  name: string;
  message: string;
  edited: boolean;
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
  width: number;
  height: number;
}

export interface GuestPhoto {
  id: string;
  storage_path: string;
  name: string;
  caption: string | null;
  created_at: string;
}
