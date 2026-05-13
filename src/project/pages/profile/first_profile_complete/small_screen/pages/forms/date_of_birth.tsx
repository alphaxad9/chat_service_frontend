import React from 'react';
import { Briefcase, Globe, Lock } from 'lucide-react'; // Import icons

interface DateInputProps {
  dateOfBirth: { day: string; month: string; year: string };
  setDateOfBirth: React.Dispatch<React.SetStateAction<{ day: string; month: string; year: string }>>;
  gender: string;
  setGender: React.Dispatch<React.SetStateAction<string>>;
  profession: string;
  setProfession: React.Dispatch<React.SetStateAction<string>>;
  accountType: 'public' | 'private'; // ✅ stricter and correct
  setAccountType: React.Dispatch<React.SetStateAction<'public' | 'private'>>; // ✅
  bio: string;
  setBio: React.Dispatch<React.SetStateAction<string>>;
  months: number[];
  days: number[];
  years: number[];
}

const DateInput: React.FC<DateInputProps> = ({
  dateOfBirth,
  setDateOfBirth,gender,setGender,profession,setProfession,accountType,setAccountType,
  bio,setBio,months,days,years,
}) => {
    const AccountIcon = accountType === 'private' ? Lock : Globe;
  
  return (
    <div>
      <div className="mb-4 w-[98%] max-w-xs">
        <label className="block text-sm font-semibold mb-2">Date of Birth</label>
        <div className="flex space-x-2">
          <select
            value={dateOfBirth.day}
            onChange={(e) => setDateOfBirth({ ...dateOfBirth, day: e.target.value })}
            className="bg-dark text-light w-1/3 px-4 py-2 border border-slate-300 rounded-[4px] focus:outline-none focus:ring-2 focus:ring-blue-200"
          >
            <option value="">Day</option>
            {days.map((day) => (
              <option key={day} value={day}>
                {day}
              </option>
            ))}
          </select>
          <select
            value={dateOfBirth.month}
            onChange={(e) => setDateOfBirth({ ...dateOfBirth, month: e.target.value })}
            className="bg-dark text-light w-1/3 px-4 py-2 border border-slate-300 rounded-[4px] focus:outline-none focus:ring-2 focus:ring-blue-200"
          >
            <option value="">Month</option>
            {months.map((month) => (
              <option key={month} value={month}>
                {month}
              </option>
            ))}
          </select>
          <select
            value={dateOfBirth.year}
            onChange={(e) => setDateOfBirth({ ...dateOfBirth, year: e.target.value })}
            className="bg-dark text-light w-1/3 px-4 py-2 border border-slate-300 rounded-[4px] focus:outline-none focus:ring-2 focus:ring-blue-200"
          >
            <option value="">Year</option>
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Ask gender with male, female, other options */}
      <div className="mb-6 w-[98%] max-w-xs">
        <label className="block text-sm font-semibold mb-2">Gender</label>
        <div className="flex space-x-4">
          <label className="flex items-center">
            <input
              type="radio"
              value="male"
              checked={gender === 'male'}
              onChange={(e) => setGender(e.target.value)}
              className="mr-2 text-blue-600 focus:ring-blue-200"
            />
            Male
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              value="female"
              checked={gender === 'female'}
              onChange={(e) => setGender(e.target.value)}
              className="mr-2 text-blue-600 focus:ring-blue-200"
            />
            Female
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              value="other"
              checked={gender === 'other'}
              onChange={(e) => setGender(e.target.value)}
              className="mr-2 text-blue-600 focus:ring-blue-200"
            />
            Other
          </label>
        </div>
      </div>

      {/* Profession select */}
      <div className="mb-6 w-[98%] max-w-xs">
        <label className="block text-sm font-semibold mb-2">Profession</label>
        <div className="relative">
                  <Briefcase
                    size={18}
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 pointer-events-none"
                  />
                  <select
                    value={profession}
                    onChange={(e) => setProfession(e.target.value)}
                    className="bg-dark text-light w-[98%] pl-10 pr-4 py-2 border border-slate-300 rounded-[4px] focus:outline-none focus:ring-2 focus:ring-blue-200 appearance-none"
                  >
                    <option value="">Select Profession</option>
                    <option value="developer">Developer</option>
                    <option value="designer">Designer</option>
                    <option value="other">Other</option>
                  </select>
                </div>
      </div>

      
      <div className="mb-6 w-[98%] max-w-xs">
        <label className="block text-sm font-semibold mb-2">Profile Type</label>
        <div className="relative">
          <AccountIcon
            size={18}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 pointer-events-none"
          />
          <select
  value={accountType}
  onChange={(e) => setAccountType(e.target.value as 'public' | 'private')}
  
            className="bg-dark text-light w-[98%] pl-10 pr-4 py-2 border border-slate-300 rounded-[4px] focus:outline-none focus:ring-2 focus:ring-blue-200 appearance-none"
          >
            <option value="public">Public</option>
            <option value="private">Private</option>
          </select>
        </div>
      </div>

      {/* Bio */}
      <div className="mb-6 w-[98%] max-w-xs">
        <label className="block text-sm font-semibold mb-2">Bio</label>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Tell us about yourself"
          className="bg-dark text-light w-[98%] px-4 py-2 border border-slate-300 rounded-[4px] focus:outline-none focus:ring-2 focus:ring-blue-200 h-24 resize-none"
        />
      </div>
    </div>
  );
};

export default DateInput;