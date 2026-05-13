import React from 'react';

interface DateOfBirth {
  day: string;
  month: string;
  year: string;
}

// ✅ Accept a direct setter, not React.Dispatch
interface PageProps {
  dateOfBirth: DateOfBirth;
  setDateOfBirth: (value: DateOfBirth) => void; // ✅ changed
  gender: string;
  setGender: (value: string) => void;
}

const BirthAndGender: React.FC<PageProps> = ({
  dateOfBirth,
  setDateOfBirth,
  gender,
  setGender,
}) => {
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => currentYear - i);
  const days = Array.from({ length: 31 }, (_, i) => i + 1);

  return (
    <div className="px-6 flex flex-col lg_profile_complete:flex-row items-center justify-around">
      {/* Date of Birth */}
      <div className="p-3 mb-4 w-[98%] max-w-xs">
        <label className="block text-sm font-semibold mb-2">Date of Birth</label>
        <div className="flex space-x-2">
          <select
            value={dateOfBirth.day}
            onChange={(e) =>
              setDateOfBirth({ ...dateOfBirth, day: e.target.value })
            }
            className="bg-dark text-light w-1/3 px-4 py-2 border border-slate-300 rounded-[4px] focus:outline-none focus:ring-2 focus:ring-blue-200"
          >
            <option value="">Day</option>
            {days.map((day) => (
              <option key={day} value={day.toString()}>
                {day}
              </option>
            ))}
          </select>

          <select
            value={dateOfBirth.month}
            onChange={(e) =>
              setDateOfBirth({ ...dateOfBirth, month: e.target.value })
            }
            className="bg-dark text-light w-1/3 px-4 py-2 border border-slate-300 rounded-[4px] focus:outline-none focus:ring-2 focus:ring-blue-200"
          >
            <option value="">Month</option>
            {months.map((month) => (
              <option key={month} value={month.toString()}>
                {month}
              </option>
            ))}
          </select>

          <select
            value={dateOfBirth.year}
            onChange={(e) =>
              setDateOfBirth({ ...dateOfBirth, year: e.target.value })
            }
            className="bg-dark text-light w-1/3 px-4 py-2 border border-slate-300 rounded-[4px] focus:outline-none focus:ring-2 focus:ring-blue-200"
          >
            <option value="">Year</option>
            {years.map((year) => (
              <option key={year} value={year.toString()}>
                {year}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Gender */}
      <div className="p-3 mb-3 w-[98%] max-w-xs">
        <label className="block text-sm font-semibold mb-2">Gender</label>
        <div className="flex space-x-4">
          {(['male', 'female', 'other'] as const).map((g) => (
            <label key={g} className="flex items-center">
              <input
                type="radio"
                value={g}
                checked={gender === g}
                onChange={(e) => setGender(e.target.value)}
                className="mr-2 text-blue-600 focus:ring-blue-200"
              />
              {g.charAt(0).toUpperCase() + g.slice(1)}
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BirthAndGender;