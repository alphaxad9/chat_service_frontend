// src/project/pages/profile/ui/FillLargeScreen.tsx
import { User, Camera } from 'lucide-react';
import PersonalInfo from './pages/personal_info';
import { useAuth } from '../../../../../apis/user/authentication/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Country from './pages/country';
import { CountryOption, LanguageOption } from './pages/country';
import { useUpdateProfile } from '../../../../../apis/user/authentication/Hooks';
import { UpdateProfileFormData } from '../../../../../modules/user/authentication/types/auth';
import BirthAndGender from './pages/birth_gender';
import { useUpdateMyProfile } from '../../../../../apis/user/profile/hooks';
import FullNames from './pages/fullNames';
import Theme from './pages/theme';
import FullScreenLoader from '../../../../entities/ui/components/FullScreenLoader';
import { useDispatch } from 'react-redux';
import AuthLoader from '../../../../shared/ui/loader/authentication_loader';
import { triggerAuthLoading } from '../../../../freatures/login_and_register/state/authUiSlice';
import ProfessionAndAccoutType from './pages/profession_profile_type';
import { UpdateProfileRequest } from '../../../../../apis/user/profile/types';
import { parseDate, formatDate } from './helpers/helpers';

const FillLargeScreen = () => {
  const updateProfileMutation = useUpdateMyProfile();
  const updateUserMutation = useUpdateProfile();
  const isSubmitting = updateProfileMutation.isPending || updateUserMutation.isPending;
  const navigate = useNavigate();
  const { myProfile, isProfileLoading, profile, isAuthBooting, isMyProfileLoading } = useAuth();

  const dispatch = useDispatch();

  // ─────────────────────────────────────────────────────────────
  // ✅ SEPARATE: preview strings (for UI) + File objects (for upload)
  // ─────────────────────────────────────────────────────────────
  const [formState, setFormState] = useState<{
    // From UpdateProfileRequest
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

    // UI-only: preview URLs
    first_name: string;
    last_name: string;
    profileImagePreview: string | null;
    coverImagePreview: string | null;

    // ✅ REAL File objects for upload
    profileImageFile: File | null;
    coverImageFile: File | null;

    dateOfBirth: { day: string; month: string; year: string };
    locationOption: CountryOption | null;
    languageOption: LanguageOption | null;
  }>({
    bio: '',
    profession: '',
    account_type: 'public',
    date_of_birth: null,
    gender: '',
    phone: '+32432400000',
    location: null,
    language: null,
    theme: 'system',
    cover_image: null,
    first_name: '',
    last_name: '',
    profileImagePreview: null,
    coverImagePreview: null,
    profileImageFile: null,
    coverImageFile: null,
    dateOfBirth: { day: '', month: '', year: '' },
    locationOption: null,
    languageOption: null,
  });

  // Sync myProfile into form state once loaded
  useEffect(() => {
    if (myProfile && !isProfileLoading && !isMyProfileLoading) {
      const dobParts = parseDate(myProfile.date_of_birth);

      setFormState((prev) => ({
        ...prev,
        // API fields
        bio: myProfile.bio ?? '',
        profession: myProfile.profession ?? '',
        account_type: myProfile.account_type,
        date_of_birth: myProfile.date_of_birth,
        gender: myProfile.gender ?? '',
        phone: myProfile.phone ?? '+12195550114',
        location: myProfile.location ?? null,
        language: myProfile.language ?? null,
        theme: (myProfile.theme as 'light' | 'dark' | 'system') ?? 'system',
        cover_image: myProfile.cover_image ?? null,

        // Profile fields
        first_name: profile?.first_name ?? '',
        last_name: profile?.last_name ?? '',
        profileImagePreview: profile?.profile_picture ?? null,
        profileImageFile: null, // reset file on load

        // UI state
        dateOfBirth: dobParts,
        locationOption: myProfile.location
          ? { value: myProfile.location, label: myProfile.location }
          : null,
        languageOption: myProfile.language
          ? { value: myProfile.language, label: myProfile.language }
          : null,
      }));
    }
  }, [myProfile, isProfileLoading, isMyProfileLoading, profile]);

  // ─────────────────────────────────────────────────────────────
  // 🖼️ Image handlers: store BOTH preview + real File
  // ─────────────────────────────────────────────────────────────
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // ✅ Store real File for upload
      setFormState((prev) => ({ ...prev, profileImageFile: file }));
      // ✅ Create preview URL for UI
      const previewUrl = URL.createObjectURL(file);
      setFormState((prev) => ({ ...prev, profileImagePreview: previewUrl }));
    }
  };

  const handleSubmit = async () => {
    const dob = formatDate(formState.dateOfBirth);
    const PLACEHOLDER_PHONE = '+12195550114';
    const phoneToSubmit = formState.phone === PLACEHOLDER_PHONE ? null : formState.phone;

    // ── 1. Prepare User payload (first_name, last_name, profile_picture) ──
    let userPayload: UpdateProfileFormData | FormData;

    // Check if we have ANY file to upload (profile or cover)
    const hasProfileFile = !!formState.profileImageFile;
    const hasCoverFile = !!formState.coverImageFile;

    if (hasProfileFile || hasCoverFile) {
      // ✅ Use FormData for file uploads
      const formData = new FormData();
      
      // Always include text fields
      formData.append('first_name', formState.first_name);
      formData.append('last_name', formState.last_name);
      
      // Add profile_picture if file exists
      if (hasProfileFile) {
        formData.append('profile_picture', formState.profileImageFile!);
      } else if (formState.profileImagePreview === null) {
        // User removed the image → send empty to clear
        formData.append('profile_picture', '');
      }
      
      // ✅ Add cover_image if file exists (send to same endpoint or adjust as needed)
      if (hasCoverFile) {
        formData.append('cover_image', formState.coverImageFile!);
      } else if (formState.coverImagePreview === null && formState.cover_image) {
        // User removed cover → send empty to clear
        formData.append('cover_image', '');
      }
      
      userPayload = formData;
    } else {
      // ✅ Plain object for text-only update
      userPayload = {
        first_name: formState.first_name,
        last_name: formState.last_name,
        profile_picture: formState.profileImagePreview ?? '',
      };
    }

    // ── 2. Prepare Profile payload (bio, profession, etc.) ──
    const profilePayload: UpdateProfileRequest = {
      bio: formState.bio || null,
      profession: formState.profession || null,
      account_type: formState.account_type,
      ...(dob !== null && { date_of_birth: dob }),
      gender: formState.gender || null,
      phone: phoneToSubmit,
      location: formState.location,
      language: formState.language,
      theme: formState.theme,
      // ✅ Only send cover_image as string if NO file was uploaded
      cover_image: hasCoverFile ? null : formState.cover_image,
    };

    dispatch(triggerAuthLoading());

    try {
      await Promise.all([
        updateUserMutation.mutateAsync(userPayload),   // ← FormData (with files) or plain object
        updateProfileMutation.mutateAsync(profilePayload),
      ]);
      navigate('/');
    } catch (error) {
      console.error('Profile update failed:', error);
    } finally {
      dispatch(triggerAuthLoading());
    }
  };

  const handleSkip = () => {
    dispatch(triggerAuthLoading());
    navigate('/');
  };

  const {
    bio,
    profession,
    account_type,
    gender,
    phone,
    theme,
    first_name,
    last_name,
    profileImagePreview,
    dateOfBirth,
    locationOption,
    languageOption,
  } = formState;

  const setBio = (value: string) => setFormState((prev) => ({ ...prev, bio: value }));
  const setProfession = (value: string) => setFormState((prev) => ({ ...prev, profession: value }));
  const setAccountType = (value: 'public' | 'private') =>
    setFormState((prev) => ({ ...prev, account_type: value }));
  const setGender = (value: string) => setFormState((prev) => ({ ...prev, gender: value }));
  const setPhone = (value: string | undefined) => {
    setFormState((prev) => ({ ...prev, phone: value ?? null }));
  };
  const setTheme = (value: 'light' | 'dark' | 'system') =>
    setFormState((prev) => ({ ...prev, theme: value }));
  const setFirstName = (value: string) => setFormState((prev) => ({ ...prev, first_name: value }));
  const setLastName = (value: string) => setFormState((prev) => ({ ...prev, last_name: value }));
  const setDateOfBirth = (value: { day: string; month: string; year: string }) =>
    setFormState((prev) => ({
      ...prev,
      dateOfBirth: value,
      date_of_birth: formatDate(value),
    }));
  const setLocationOption = (option: CountryOption | null) =>
    setFormState((prev) => ({
      ...prev,
      locationOption: option,
      location: option?.value ?? null,
    }));
  const setLanguageOption = (option: LanguageOption | null) =>
    setFormState((prev) => ({
      ...prev,
      languageOption: option,
      language: option?.value ?? null,
    }));

  if (isAuthBooting || isProfileLoading || isMyProfileLoading) {
    return <FullScreenLoader />;
  }

  return (
    <div className="bg-dark text-[0.8rem] text-white min-h-screen p-6">
      <div className="fixed top-0 left-0 right-0">
        <AuthLoader />
      </div>

      {/* Profile Header with Cover & Avatar - Centered Layout */}
      <div className="relative w-full mt-10 mb-8">
        {/* Cover Image Area (optional gradient background) */}
       
        {/* Centered Profile Section */}
        <div className="flex flex-col items-center -mt-12">
          {/* Profile Picture with Upload */}
          <div className="relative">
            <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-dark bg-dark flex items-center justify-center shadow-lg">
              {profileImagePreview ? (
                <img 
                  src={profileImagePreview} 
                  alt="Profile" 
                  className="w-full h-full object-cover" 
                />
              ) : (
                <User size={72} className="text-gray-400" />
              )}
            </div>
            <label
              htmlFor="profile-upload"
              className="absolute bottom-1 right-1 bg-blue-600 rounded-full p-1.5 cursor-pointer hover:bg-blue-700 transition-colors shadow-md"
              aria-label="Upload profile picture"
            >
              <Camera size={14} className="text-white" />
              <input
                id="profile-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
              />
            </label>
          </div>

          {/* Username & Tagline - Below Avatar */}
          <div className="mt-4 text-center">
            <button className="px-2 py-1.5 rounded-lg text-lg font-semibold transition hover:bg-gray-800/50">
              @{profile?.username}
            </button>
          </div>
        </div>
      </div>

      {/* Rest of the form */}
      <PersonalInfo phone={phone ?? undefined} username={profile?.username} setPhone={setPhone} />

      <Country
        location={locationOption}
        setLocation={setLocationOption}
        language={languageOption}
        setLanguage={setLanguageOption}
      />

      <div className="p-2 w-full flex flex-col items-center">
        <div className="mb-2">
          <h2 className="text-lg font-medium">Bio</h2>
        </div>
        <textarea
          value={bio ?? ''}
          onChange={(e) => setBio(e.target.value)}
          rows={3}
          placeholder="Enter your bio..."
          className="hide-scrollbar w-[96%] h-[calc(100%-2rem)] bg-dark border border-gray-300 rounded-[5px] px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
      </div>

      <ProfessionAndAccoutType
        profession={profession ?? ''}
        setProfession={setProfession}
        accountType={account_type}
        setAccountType={setAccountType}
      />

      <BirthAndGender
        dateOfBirth={dateOfBirth}
        setDateOfBirth={setDateOfBirth}
        gender={gender ?? ''}
        setGender={setGender}
      />

      <FullNames
        first_name={first_name}
        setFirstName={setFirstName}
        last_name={last_name}
        setLastName={setLastName}
      />

      <Theme theme={theme} setTheme={setTheme} />

      <div className="flex flex-row items-center justify-around pt-4">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting}
          className={`py-2 px-4 font-semibold rounded-xl shadow-md transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-blue-300 ${
            isSubmitting
              ? 'bg-gray-500 cursor-not-allowed'
              : 'bg-light from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-dark hover:scale-[1.01]'
          }`}
        >
          {isSubmitting ? 'Saving...' : 'Submit'}
        </button>
        <button
          className="py-2 px-4 bg-light from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-dark font-semibold rounded-xl shadow-md transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-blue-300 hover:scale-[1.01]"
          onClick={handleSkip}
        >
          Skip
        </button>
      </div>
    </div>
  );
};

export default FillLargeScreen;