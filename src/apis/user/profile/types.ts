// frontend/src/modules/profile/types/profile.ts

import { ProfileUserDTO } from "../../../modules/user/authentication/types/auth";
// --- Request payload for PATCH /profile ---
export interface UpdateProfileRequest {
  bio?: string | null;
  profession?: string | null;
  account_type?: "public" | "private";
  date_of_birth?: string; // ISO 8601 date string: "YYYY-MM-DD"
  gender?: string | null;
  phone?: string | null;
  location?: string | null; // e.g., "US"
  language?: string | null; // e.g., "en"
  theme?: "light" | "dark" | "system";
  cover_image?: string | null; // URL
  
}

// --- My Profile (full access) ---
export interface MyUserProfileDTO {
  user_id: string;
  user: ProfileUserDTO;
  followers_count: number;
  following_count: number;
  unread_notifications_count: number;
  last_seen_at: string | null; // ISO datetime
  is_deleted: boolean;
  bio: string | null;
  profession: string | null;
  account_type: "public" | "private";
  date_of_birth: string | null; // ISO date
  gender: string | null;
  phone: string | null;
  location: string | null;
  language: string | null;
  theme: string | null;
  cover_image: string | null;
  created_at: string | null; // ISO datetime
  updated_at: string | null; // ISO datetime
}

// --- Foreign Profile (limited fields) ---
export interface ForeignUserProfileDTO {
  user_id: string;
  user: ProfileUserDTO;
  followers_count: number;
  following_count: number;
  bio: string | null;
  profession: string | null;
  account_type: "public" | "private";
  location: string | null;
  cover_image: string | null;
  created_at: string | null; // ISO datetime
}