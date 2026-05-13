import { CountryOption } from "../pages/country";
import { LanguageOption } from "../pages/country";
export const parseDate = (isoDate: string | null): { day: string; month: string; year: string } => {
  if (!isoDate) return { day: '', month: '', year: '' };
  const [year, month, day] = isoDate.split('-');
  return { day, month, year };
};



export const formatDate = ({ day, month, year }: { day: string; month: string; year: string }): string | null => {
  if (!day || !month || !year) return null;
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
};


export interface FormState {
  bio: string | null;
  profession: string | null;
  account_type: 'public' | 'private';
  date_of_birth: string | null;
  gender: string | null;
  phone: string | null;
  location: string | null;
  language: string | null;
  theme: 'light' | 'dark' | 'system';
  cover_image: string | null;
  first_name: string;
  last_name: string;
  profileImage: string | null;
  dateOfBirth: { day: string; month: string; year: string };
  locationOption: CountryOption | null;
  languageOption: LanguageOption | null;
}



export interface SmallScreenFormState {
  // Section 1
  phone: string | null;
  location: string | null;
  locationOption: CountryOption | null;
  cover_image: string | null;      // ✅
  profileImage: string | null;    // ✅

  // Section 2
  bio: string | null;
  profession: string | null;
  account_type: 'public' | 'private';
  date_of_birth: string | null;
  gender: string | null;
  dateOfBirth: { day: string; month: string; year: string };

  // Section 3
  first_name: string;
  last_name: string;
  theme: 'light' | 'dark' | 'system';
  language: string | null;
  languageOption: LanguageOption | null;
}