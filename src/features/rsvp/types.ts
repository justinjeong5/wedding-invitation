export interface SavedRsvp {
  id: string;
  name: string;
  side: string;
  attendance: boolean;
  guest_count: number;
  meal: boolean;
  message: string | null;
  submitted_at: string;
}
