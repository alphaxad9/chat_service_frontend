// src/.../complete_profile/small_screen/pages/section3.tsx
import React, { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { setSection } from '../../../lib/state/completeProfileSlice';
import { triggerAuthLoading } from '../../../../../freatures/login_and_register/state/authUiSlice';
import Select, { components, SingleValue, StylesConfig } from "react-select";
import { LanguageOption } from '../../large_screen/pages/country';
import type { FormState } from '../../large_screen/helpers/helpers';
import { useUpdateMyProfile } from '../../../../../../apis/user/profile/hooks';
import { UpdateProfileRequest } from '../../../../../../apis/user/profile/types';
import { useNavigate } from 'react-router-dom';
import { useUpdateProfile } from '../../../../../../apis/user/authentication/Hooks';
import { UpdateProfileFormData } from '../../../../../../modules/user/authentication/types/auth';

const getFlagEmoji = (countryCode: string) =>
  countryCode
    .toUpperCase()
    .replace(/./g, (char) =>
      String.fromCodePoint(127397 + char.charCodeAt(0))
    );

interface SectionThreeProps {
  formState: FormState;
  setFormState: React.Dispatch<React.SetStateAction<FormState>>;
}

const SectionThree: React.FC<SectionThreeProps> = ({ formState, setFormState }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const updateProfileMutation = useUpdateMyProfile();
  const updateUserMutation = useUpdateProfile();

  const [first_name, setFirstName] = useState(formState.first_name || '');
  const [last_name, setLastName] = useState(formState.last_name || '');
  const [theme, setTheme] = useState<FormState['theme']>(formState.theme || 'system');
  const [language, setLanguage] = useState<LanguageOption | null>(formState.languageOption || null);

  // Sync local state → formState
  useEffect(() => {
    setFormState((prev) => ({
      ...prev,
      first_name,
      last_name,
      theme,
      language: language?.value ?? null,
      languageOption: language,
    }));
  }, [first_name, last_name, theme, language, setFormState]);

  const handleBack = () => {
    dispatch(triggerAuthLoading());
    dispatch(setSection('section2'));
  };

  const handleContinue = async () => {
    dispatch(triggerAuthLoading());

    // 📝 Profile-only payload (theme, language)
    const profilePayload: UpdateProfileRequest = {
      theme,
      language: language?.value || null,
      // other profile fields not updated here
    };

    // 👤 User-only payload (first/last name)
    const userPayload: UpdateProfileFormData = {
      first_name,
      last_name,
      profilePicture: '', // not updating image here, but required by type — send empty or omit if backend allows
    };

    try {
      // 🔁 Update both user and profile
      await Promise.all([
        updateUserMutation.mutateAsync(userPayload),
        updateProfileMutation.mutateAsync(profilePayload),
      ]);
      navigate('/');
    } catch (err) {
      console.error('Profile update failed in Section3:', err);
    } finally {
      dispatch(triggerAuthLoading());
    }
  };

  const handleSkip = () => {
    dispatch(triggerAuthLoading());
    navigate('/');
  };

  const languageOptions: LanguageOption[] = [
    { value: "en", label: "English" },
    { value: "es", label: "Spanish" },
    { value: "fr", label: "French" },
  ];

  const languageFlagMap: Record<string, string> = {
    en: "US",
    es: "ES",
    fr: "FR",
  };

  const handleLanguageChange = (value: SingleValue<LanguageOption>) => {
    setLanguage(value ?? null);
  };

  const Option = (props: any) => (
    <components.Option {...props}>
      <span className="mr-2">
        {getFlagEmoji(languageFlagMap[props.data.value] || "US")}
      </span>
      {props.data.label}
    </components.Option>
  );

  const SingleValueComp = (props: any) => (
    <components.SingleValue {...props}>
      <span className="mr-2">
        {getFlagEmoji(languageFlagMap[props.data.value] || "US")}
      </span>
      {props.data.label}
    </components.SingleValue>
  );

  const customStyles: StylesConfig<any, false> = {
    control: (provided, state) => ({
      ...provided,
      backgroundColor: "#0000",
      width: "100%",
      boxShadow: state.isFocused ? "0 0 0 1px #3b82f6" : "none",
      "&:hover": { borderColor: "#3b82f6" },
    }),
    menu: (provided) => ({
      ...provided,
      backgroundColor: "#111827",
      color: "#f9fafb",
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isFocused ? "#374151" : "#111827",
      color: "#f9fafb",
      cursor: "pointer",
    }),
    singleValue: (provided) => ({
      ...provided,
      color: "#f9fafb",
    }),
    input: (provided) => ({
      ...provided,
      color: "#f9fafb",
    }),
    placeholder: (provided) => ({
      ...provided,
      color: "#9ca3af",
    }),
  };

  // 🔘 Better loading state (optional but recommended)
  const isSubmitting = updateUserMutation.isPending || updateProfileMutation.isPending;

  return (
    <div className="bg-dark text-light h-full min-h-screen w-screen flex items-center justify-center relative">
      <button
        onClick={handleBack}
        className="absolute top-4 left-4 text-light hover:text-blue-200 transition-colors"
      >
        <ArrowLeft size={24} />
      </button>

      <button
        onClick={handleSkip}
        className="absolute top-4 right-4 bg-transparent text-light font-semibold rounded-[4px] px-3 py-1 hover:bg-slate-700 transition-all duration-300"
      >
        Skip
      </button>

      <div className="w-full p-3 flex flex-col items-center">
        <h1 className="text-5xl block font-extrabold text-white mb-4">ZedVyde</h1>

        <div className="mb-6 w-full max-w-xs">
          <label className="block text-sm font-semibold mb-2">First Name</label>
          <input
            type="text"
            value={first_name}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="Enter your first name"
            className="bg-dark text-light w-full px-4 py-2 border border-slate-300 rounded-[4px] focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
        </div>

        <div className="mb-6 w-full max-w-xs">
          <label className="block text-sm font-semibold mb-2">Last Name</label>
          <input
            type="text"
            value={last_name}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Enter your last name"
            className="bg-dark text-light w-full px-4 py-2 border border-slate-300 rounded-[4px] focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
        </div>

        <div className="mb-6 w-full max-w-xs">
          <label className="block text-sm font-semibold mb-2">Theme</label>
          <div className="flex space-x-2">
            {(['light', 'dark', 'system'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTheme(t)}
                className={`flex-1 py-2 px-4 rounded-[4px] transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-200 ${
                  theme === t
                    ? 'bg-light text-dark font-semibold shadow-md'
                    : 'bg-dark border border-slate-300 text-light hover:bg-slate-700'
                }`}
              >
                {t === 'system' ? 'System' : t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-6 w-full max-w-xs">
          <label className="block text-sm font-semibold mb-2">Language</label>
          <Select
            name="language"
            options={languageOptions}
            value={language}
            onChange={handleLanguageChange}
            components={{ Option, SingleValue: SingleValueComp }}
            styles={customStyles}
            placeholder="Select Language"
          />
        </div>

        <button
          type="button"
          onClick={handleContinue}
          disabled={isSubmitting} // ✅ Now reflects both mutations
          className={`w-[80%] max-w-xs py-2 px-4 font-semibold rounded-xl shadow-md transition hover:scale-[1.01] ${
            isSubmitting
              ? 'bg-gray-500 cursor-not-allowed'
              : 'bg-light text-dark'
          }`}
        >
          {isSubmitting ? 'Saving...' : 'Submit'}
        </button>
      </div>
    </div>
  );
};

export default SectionThree;