import React, { useEffect, useMemo, useState } from 'react';
import countryList from "react-select-country-list";

import Select, { components, SingleValue, StylesConfig } from "react-select";
import countriesLib from 'i18n-iso-countries';
import PhoneForm from './phone_form';
import { CountryOption } from '../../../large_screen/pages/country';
const CURRENT_LOCALE = 'en'; // Change to 'es', 'fr', etc. as needed



interface CountryFormProps {
  location: CountryOption | null;
  phone: string | undefined;
  setLocation: (value: CountryOption | null) => void;
  setPhone: (value: string | undefined) => void;

}


const getFlagEmoji = (countryCode: string) =>
  countryCode
    .toUpperCase()
    .replace(/./g, (char) =>
      String.fromCodePoint(127397 + char.charCodeAt(0))
    );


const CountryForm: React.FC<CountryFormProps> = ({ location, phone, setLocation, setPhone }) => {
  const [localeLoaded, setLocaleLoaded] = useState(false);
 
  useEffect(() => {
    const loadLocale = async () => {
      try {
        const localeModule = await import(
          `i18n-iso-countries/langs/${CURRENT_LOCALE}.json`
        );
        countriesLib.registerLocale(localeModule.default);
      } catch (err) {
        console.warn(`Locale ${CURRENT_LOCALE} not found, falling back to English`);
        const enModule = await import('i18n-iso-countries/langs/en.json');
        countriesLib.registerLocale(enModule.default);
      } finally {
        setLocaleLoaded(true);
      }
    };

    loadLocale();
  }, []);

  // Generate country options with localized names and flags — only after locale is loaded
  const countryOptions: CountryOption[] = useMemo(
      () => countryList().getData(),
      []
    );

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
  // Handle country selection
 
   const handleCountryChange = (value: SingleValue<CountryOption>) => {
      setLocation(value ?? null);
    };
 

  if (!localeLoaded) {
    return <div>Loading countries...</div>; // Or show skeleton
  }
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
    <div>
      {/* Country Select */}
      <div className="mb-6">
        <label className="block text-sm font-semibold mb-2 text-center">Country</label>
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

      {/* Phone Input */}
      <PhoneForm phone={phone} setPhone={setPhone}/>
    </div>
  );
};

export default CountryForm;