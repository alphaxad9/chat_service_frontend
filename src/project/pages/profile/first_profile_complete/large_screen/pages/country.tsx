import { useMemo } from "react";
import Select, { components, SingleValue, StylesConfig } from "react-select";

// You can still keep country list if needed elsewhere
import countryList from "react-select-country-list";

// Define types
export interface CountryOption {
  label: string;
  value: string;
}

export interface LanguageOption {
  label: string;
  value: string;
}

interface FormProps {
  location: CountryOption | null;
  setLocation: (value: CountryOption | null) => void;
  language: LanguageOption | null; // 👈 Updated to object, not string
  setLanguage: (value: LanguageOption | null) => void; // 👈 Updated type
}

// Get flag emoji from country ISO code
const getFlagEmoji = (countryCode: string) =>
  countryCode
    .toUpperCase()
    .replace(/./g, (char) =>
      String.fromCodePoint(127397 + char.charCodeAt(0))
    );

// Map languages to representative country codes for flags
const languageFlagMap: Record<string, string> = {
  en: "US", // English → United States
  es: "ES", // Spanish → Spain
  fr: "FR", // French → France
  de: "DE", // German → Germany
  ja: "JP", // Japanese → Japan
  ko: "KR", // Korean → South Korea
  zh: "CN", // Chinese → China
  ar: "SA", // Arabic → Saudi Arabia
  ru: "RU", // Russian → Russia
  pt: "BR", // Portuguese → Brazil
  // Add more as needed
};

const Country: React.FC<FormProps> = ({
  location,
  setLocation,
  language,
  setLanguage,
}) => {
  // Country options
  const countryOptions: CountryOption[] = useMemo(
    () => countryList().getData(),
    []
  );

  // Language options with labels and flag mapping
  const languageOptions: LanguageOption[] = [
    { value: "en", label: "English" },
    { value: "es", label: "Spanish" },
    { value: "fr", label: "French" },
  ];

  // Handle country change
  const handleCountryChange = (value: SingleValue<CountryOption>) => {
    setLocation(value ?? null);
  };

  // Handle language change
  const handleLanguageChange = (value: SingleValue<LanguageOption>) => {
    setLanguage(value ?? null);
  };

  // Custom Option component (for both dropdowns)
  const Option = (props: any) => (
    <components.Option {...props}>
      <span className="mr-2">
        {getFlagEmoji(
          props.selectProps.name === "language"
            ? languageFlagMap[props.data.value] || "US"
            : props.data.value
        )}
      </span>
      {props.data.label}
    </components.Option>
  );

  // Custom SingleValue component (for both dropdowns)
  const SingleValueComp = (props: any) => (
    <components.SingleValue {...props}>
      <span className="mr-2">
        {getFlagEmoji(
          props.selectProps.name === "language"
            ? languageFlagMap[props.data.value] || "US"
            : props.data.value
        )}
      </span>
      {props.data.label}
    </components.SingleValue>
  );

  // 🎨 Dark mode styling (shared)
  const customStyles: StylesConfig<any, false> = {
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
      backgroundColor: "#111827", // gray-900
      color: "#f9fafb", // gray-50
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isFocused ? "#374151" : "#111827", // gray-700 on hover
      color: "#f9fafb",
      cursor: "pointer",
    }),
    singleValue: (provided) => ({
      ...provided,
      color: "#f9fafb", // white text
    }),
    input: (provided) => ({
      ...provided,
      color: "#f9fafb",
    }),
    placeholder: (provided) => ({
      ...provided,
      color: "#9ca3af", // gray-400
    }),
  };

  return (
    <div className="px-6 w-full flex flex-col lg_profile_complete:flex-row items-center justify-around">
      {/* Country Selector */}
      <div className="p-3 mb-6 flex items-center space-x-3 w-full flex-col">
        <label className="block text-lg font-medium flex justify-center">
          Country
        </label>
        <div className="flex-grow w-full">
          <Select
            name="country" 
            options={countryOptions}
            value={location}
            onChange={handleCountryChange}
            components={{ Option, SingleValue: SingleValueComp }}
            styles={customStyles}
            placeholder="Select your country"
          />
        </div>
      </div>

      {/* Language Selector */}
      <div className="p-3 mb-6 w-full">
        <label className="block text-lg font-medium flex justify-center">
          Language
        </label>
        <div className="w-full">
          <Select
            name="language" // 👈 key for flag mapping in custom components
            options={languageOptions}
            value={language}
            onChange={handleLanguageChange}
            components={{ Option, SingleValue: SingleValueComp }}
            styles={customStyles}
            placeholder="Select Language"
          />
        </div>
      </div>
    </div>
  );
};

export default Country;