import React, { useState, useEffect } from 'react';
import DateInput from './forms/date_of_birth';
import { ArrowLeft } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { triggerAuthLoading } from '../../../../../freatures/login_and_register/state/authUiSlice';
import { setSection } from '../../../lib/state/completeProfileSlice';
import type { FormState } from '../../large_screen/helpers/helpers';
import { formatDate } from '../../large_screen/helpers/helpers';
import { useUpdateMyProfile } from '../../../../../../apis/user/profile/hooks'; // ← ADD THIS
import { UpdateProfileRequest } from '../../../../../../apis/user/profile/types';
interface SectionTwoProps {
  formState: FormState;
  setFormState: React.Dispatch<React.SetStateAction<FormState>>;
}

const SectionTwo: React.FC<SectionTwoProps> = ({ formState, setFormState }) => {
  const dispatch = useDispatch();
  const updateProfileMutation = useUpdateMyProfile(); // ← ADD THIS

  const [dateOfBirth, setDateOfBirth] = useState(formState.dateOfBirth);
  const [gender, setGender] = useState(formState.gender || '');
  const [profession, setProfession] = useState(formState.profession || '');
  const [accountType, setAccountType] = useState(formState.account_type || 'public');
  const [bio, setBio] = useState(formState.bio || '');

  // Keep syncing local state → formState (for consistency & skip logic)
  useEffect(() => {
    const dobFormatted = formatDate(dateOfBirth);
    setFormState((prev) => ({
      ...prev,
      dateOfBirth,
      date_of_birth: dobFormatted,
      gender,
      profession,
      account_type: accountType,
      bio,
    }));
  }, [dateOfBirth, gender, profession, accountType, bio, setFormState]);

  const handleBack = () => {
    dispatch(triggerAuthLoading());
    dispatch(setSection('section1'));
  };

  // ✅ NEW: Submit data before proceeding
  const handleContinue = async () => {
  const dobFormatted = formatDate(dateOfBirth); // returns string | null

  const payload: UpdateProfileRequest = {
    date_of_birth: dobFormatted ?? undefined, // 👈 null → undefined
    gender: gender || undefined,
    profession: profession || undefined,
    account_type: accountType,
    bio: bio || undefined,
  };

  dispatch(triggerAuthLoading());
  try {
    await updateProfileMutation.mutateAsync(payload);
    dispatch(setSection('section3'));
  } catch (err) {
    console.error('Profile update failed in Section2:', err);
  } finally {
    dispatch(triggerAuthLoading());
  }
};

  const handleSkip = () => {
    dispatch(triggerAuthLoading());
    dispatch(setSection('section3'));
  };

  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => currentYear - i);
  const days = Array.from({ length: 31 }, (_, i) => i + 1);

  return (
    <div className="bg-dark text-light h-full min-h-screen w-[98%] flex items-center justify-center relative">
      <button
        onClick={handleBack}
        className="absolute top-4 left-4 text-light hover:text-blue-200 transition-colors"
      >
        <ArrowLeft size={24} />
      </button>

      <button
        onClick={handleSkip}
        className="absolute top-4 right-4 bg-transparent text-light font-semibold rounded-xl px-3 py-1 hover:bg-slate-700 transition-all duration-300"
      >
        Skip
      </button>

      <div className="w-[97%] p-2 flex flex-col items-center mt-10">
        <DateInput
          dateOfBirth={dateOfBirth}
          setDateOfBirth={setDateOfBirth}
          gender={gender}
          setGender={setGender}
          profession={profession}
          setProfession={setProfession}
          accountType={accountType}
          setAccountType={setAccountType}
          bio={bio}
          setBio={setBio}
          months={months}
          days={days}
          years={years}
        />
        <button
          type="button"
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
    </div>
  );
};

export default SectionTwo;