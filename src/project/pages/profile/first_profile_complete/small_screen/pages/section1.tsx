import React from 'react';
import { User, Camera } from 'lucide-react';
import CountryForm from './forms/country_phone';
// ✅ UPDATE THIS IMPORT
import type { SmallScreenFormState } from '../../large_screen/helpers/helpers'; // or move type to shared location
import type { CountryOption } from '../../large_screen/pages/country';
import { useDispatch } from 'react-redux';
import { triggerAuthLoading } from '../../../../../freatures/login_and_register/state/authUiSlice';
import { setSection } from '../../../lib/state/completeProfileSlice';
import { useUpdateMyProfile } from '../../../../../../apis/user/profile/hooks';

// ✅ Update props type
interface SectionOneProps {
  formState: SmallScreenFormState;
  setFormState: React.Dispatch<React.SetStateAction<SmallScreenFormState>>;
  username: string | undefined;
  email: string | undefined;
}

const SectionOne: React.FC<SectionOneProps> = ({ formState, setFormState, username, email }) => {
  const updateProfileMutation = useUpdateMyProfile();
  const dispatch = useDispatch();

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormState((prev) => ({
        ...prev,
        profileImage: reader.result as string,
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormState((prev) => ({
        ...prev,
        cover_image: reader.result as string,
      }));
    };
    reader.readAsDataURL(file);
  };

  const setPhone = (value: string | undefined) => {
    setFormState((prev) => ({ ...prev, phone: value ?? null }));
  };

  const setLocationOption = (option: CountryOption | null) => {
    setFormState((prev) => ({
      ...prev,
      locationOption: option,
      location: option?.value ?? null,
    }));
  };

  const handleSkip = () => {
    dispatch(triggerAuthLoading());
    dispatch(setSection('section2'));
  };

  // ✅ Remove cover_image from payload (submit later)
  const handleContinue = async () => {
    const payload = {
      phone: formState.phone,
      location: formState.location,
      // ❌ Do NOT submit cover_image here — wait until final step
    };

    dispatch(triggerAuthLoading());
    try {
      await updateProfileMutation.mutateAsync(payload);
      dispatch(setSection('section2'));
    } catch (err) {
      console.error('Profile update failed:', err);
    } finally {
      dispatch(triggerAuthLoading());
    }
  };

  return (
    <div className="bg-dark text-light h-full min-h-screen w-screen flex flex-col items-center relative overflow-hidden">
      <button
        onClick={handleSkip}
        className="absolute top-4 right-4 bg-transparent text-light font-semibold rounded-xl px-3 py-1 hover:bg-slate-700 transition"
      >
        Skip
      </button>

      {/* Cover + Profile Photo */}
      <div className="relative w-full max-w-md h-48 mb-12">
        <div className="absolute inset-0 bg-gray-800">
          {formState.cover_image ? (
            <img
              src={formState.cover_image}
              alt="Cover"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-500 text-sm">
              Add cover photo
            </div>
          )}
        </div>

        <label
          htmlFor="cover-upload"
          className="absolute top-3 right-3 bg-black/50 text-white p-1.5 rounded-full cursor-pointer hover:bg-black/70 transition"
        >
          <Camera size={14} />
          <input
            id="cover-upload"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleCoverUpload}
          />
        </label>

        <div className="absolute -bottom-12 left-6 z-10">
          <div className="relative">
            <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-dark bg-dark flex items-center justify-center">
              {formState.profileImage ? (
                <img
                  src={formState.profileImage}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <User size={48} className="text-gray-400" />
              )}
            </div>
            <label
              htmlFor="profile-upload"
              className="absolute bottom-0 right-0 bg-blue-600 rounded-full p-1.5 cursor-pointer hover:bg-blue-700 transition"
            >
              <Camera size={14} />
              <input
                id="profile-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
              />
            </label>
          </div>
        </div>
      </div>

      <p className="text-lg font-semibold mt-16">{username || 'User'}</p>
      <p className="text-sm text-blue-200 mb-6">{email || ''}</p>

      <CountryForm
        phone={formState.phone ?? undefined}
        location={formState.locationOption}
        setLocation={setLocationOption}
        setPhone={setPhone}
      />

      <button
        onClick={handleContinue}
        disabled={updateProfileMutation.isPending}
        className={`w-[80%] max-w-xs py-2 px-4 font-semibold rounded-xl shadow-md transition hover:scale-[1.01] ${
          updateProfileMutation.isPending
            ? 'bg-gray-500 cursor-not-allowed'
            : 'bg-light text-dark'
        }`}
      >
        {updateProfileMutation.isPending ? 'Saving...' : 'Continue'}
      </button>
    </div>
  );
};

export default SectionOne;