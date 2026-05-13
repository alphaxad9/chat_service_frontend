// ProfileEdidForms.tsx
import { useSelector } from "react-redux";
import { RootState } from "../../../../../entities/store";
import { Briefcase } from "lucide-react";
import Select, { components, SingleValue, StylesConfig } from "react-select";
import countryList from "react-select-country-list";
import { useMemo } from "react";
import PhoneInput from "react-phone-number-input";
import { Phone } from 'lucide-react';

// Define CountryOption explicitly for clarity
interface CountryOption {
  value: string; // e.g., "US"
  label: string; // e.g., "United States"
}

interface ProfileEditFormsProps {
  bio: string;
  profession: string;
  first_name: string;
  last_name: string;
  location: string; 
  phone: string | undefined;
  setPhone: (value: string | undefined) => void;
  setBio: (value: string) => void;
  setFirstName: (value: string) => void;
  setLastName: (value: string) => void;
  setProfession: (value: string) => void;
  setLocation: (value: string) => void;
}

const ProfileEdidForms = ({
  bio,
  profession,
  location,
  first_name,
  phone,
  setPhone,
  setBio,
  setProfession,
  setLocation,
  setFirstName,
  setLastName,
  last_name,
}: ProfileEditFormsProps) => {
  const darkmode = useSelector((state: RootState) => state.theme.isDark);
  
  const countryOptions: CountryOption[] = useMemo(
    () => countryList().getData(),
    []
  );

  // ✅ Fix 1: Extract .value (country code) as string
  const handleCountryChange = (option: SingleValue<CountryOption>) => {
    setLocation(option?.value || '');
  };

  const getFlagEmoji = (countryCode: string) =>
    countryCode
      .toUpperCase()
      .replace(/./g, (char) =>
        String.fromCodePoint(127397 + char.charCodeAt(0))
      );

  // Custom SingleValue component with flag
  const SingleValueComp = (props: any) => (
    <components.SingleValue {...props}>
      <span className="mr-2">
        {getFlagEmoji(props.data.value)}
      </span>
      {props.data.label}
    </components.SingleValue>
  );

  // ✅ Optional: Custom Option component for dropdown items (with flags)
  const OptionComp = (props: any) => (
    <components.Option {...props}>
      <span className="mr-2">
        {getFlagEmoji(props.data.value)}
      </span>
      {props.data.label}
    </components.Option>
  );

  const customStyles: StylesConfig<CountryOption, false> = {
    control: (provided, state) => ({
      ...provided,
      backgroundColor: "#0000",
      width: "100%",
      boxShadow: state.isFocused ? "0 0 0 1px #3b82f6" : "none",
      "&:hover": {
        borderColor: "#3b82f6",
      },
    }),
    menu: (provided) => ({
      ...provided,
      backgroundColor: "#111827",
      color: "#ffff",
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isFocused ? "#374151" : "#111827",
      color: "#ffffff",
      cursor: "pointer",
    }),
    singleValue: (provided) => ({
      ...provided,
      color: "#ffffff",
    }),
    input: (provided) => ({
      ...provided,
      color: "#ffffff",
    }),
    placeholder: (provided) => ({
      ...provided,
      color: "#ffffff",
    }),
  };

  const customStylesForLight: StylesConfig<CountryOption, false> = {
    control: (provided, state) => ({
      ...provided,
      backgroundColor: "#f8f7f7ff",
      width: "100%",
      boxShadow: state.isFocused ? "0 0 0 1px #3b82f6" : "none",
      "&:hover": {
        borderColor: "#b8ccecff",
      },
    }),
    menu: (provided) => ({
      ...provided,
      backgroundColor: "#fcf9f9ff",
      color: "#000000ff",
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isFocused ? "#c5d5f0ff" : "#ffffffff",
      color: "#000000ff",
      cursor: "pointer",
    }),
    singleValue: (provided) => ({
      ...provided,
      color: "#000000ff",
    }),
    input: (provided) => ({
      ...provided,
      color: "#000000ff",
    }),
    placeholder: (provided) => ({
      ...provided,
      color: "#000000ff",
    }),
  };

  // Find the selected country option based on the `location` (country code)
  const selectedCountry = countryOptions.find(opt => opt.value === location) || null;

  return (
    <div className="space-y-5 pt-1">
      {/* Bio */}
      <div className="p-2 w-full flex flex-col items-center">
        <div className="mb-2">
          <h2 className="text-lg font-medium">Bio</h2>
        </div>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows={3}
          placeholder="Enter your bio..."
          className={`hide-scrollbar w-[96%] h-[calc(100%-2rem)] ${darkmode ? "bg-dark text-light" : "bg-ligh text-dark"} border border-gray-300 rounded-[5px] px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none`}
        />
      </div>

      {/* Profession & Country - Side by side on md+, stacked on sm */}
<div className="p-3 mb-6 w-full">
  <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
    {/* Profession */}
    <div className="flex-1">
      <label className="block text-sm font-semibold mb-2">Profession</label>
      <div className="relative">
        <Briefcase
          size={18}
          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 pointer-events-none"
        />
        <select
          value={profession}
          onChange={(e) => setProfession(e.target.value)}
          className={`w-full pl-10 pr-4 py-1.5 ${darkmode ? "bg-dark text-light" : "bg-light text-dark"}  border border-slate-300 rounded-[4px] focus:outline-none focus:ring-2 focus:ring-blue-200 appearance-none`}
        >
          <option value="">Select Profession</option>
          <option value="developer">Developer</option>
          <option value="designer">Designer</option>
          <option value="other">Other</option>
        </select>
      </div>
    </div>

    {/* Country */}
    <div className="flex-1">
      <label className="block text-sm font-semibold mb-2">Country</label>
      <Select
        name="country"
        options={countryOptions}
        value={selectedCountry}
        onChange={handleCountryChange}
        components={{ Option: OptionComp, SingleValue: SingleValueComp }}
        styles={darkmode ? customStyles : customStylesForLight}
        placeholder="Select your country"
      />
    </div>
  </div>
</div>

   <div className='px-6 w-full flex flex-col lg_profile_complete:flex-row items-center justify-around'>

        <div className="px-3 mb-6 flex-1">
          <label className="block text-sm font-semibold mb-2">First Name</label>
          <input
            type="text"
            value={first_name}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="Enter your first name"
            className={`${darkmode ? "bg-dark text-light" : "bg-ligh text-dark"} w-full px-4 py-2 border border-slate-300 rounded-[4px] focus:outline-none focus:ring-2 focus:ring-blue-200`}
          />
        </div>

        {/* Last name */}
        <div className="px-3 mb-6 flex-1">
          <label className="block text-sm font-semibold mb-2">Last Name</label>
          <input
            type="text"
            value={last_name}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Enter your last name"
            className={`${darkmode ? "bg-dark text-light" : "bg-ligh text-dark"} w-full px-4 py-2 border border-slate-300 rounded-[4px] focus:outline-none focus:ring-2 focus:ring-blue-200`}
          />
        </div>
      </div>
       <div className="mb-6">
      <label className="block text-sm font-semibold mb-2 text-center">Phone Number</label>
      <div className="relative phone-input-dark">
        <PhoneInput
              international
              defaultCountry="US"
              value={phone}
              onChange={setPhone}
            />
        <Phone className="absolute right-3 top-1/2 transform -translate-y-1/2 text-light" size={16} />
      </div>
    </div>
    </div>
  );
};

export default ProfileEdidForms;