import React from 'react';
import { Briefcase, Globe, Lock } from 'lucide-react';

// ✅ Use literal types
interface ProfessionProps {
  profession: string;
  setProfession: (value: string) => void;
  accountType: 'public' | 'private'; // ✅
  setAccountType: (value: 'public' | 'private') => void; // ✅
}

const ProfessionAndAccoutType: React.FC<ProfessionProps> = ({
  profession,
  setProfession,
  accountType,
  setAccountType,
}) => {
  const AccountIcon = accountType === 'private' ? Lock : Globe;

  return (
    <div className="px-6 flex flex-col lg_profile_complete:flex-row items-center justify-around">
      {/* Profession */}
      <div className="p-3 mb-6 w-[98%] max-w-xs relative">
        <label className="block text-sm font-semibold mb-2">Profession</label>
        <div className="relative">
          <Briefcase size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
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

      {/* Account Type */}
      <div className="p-3 mb-6 w-[98%] max-w-xs relative">
        <label className="block text-sm font-semibold mb-2">Profile Type</label>
        <div className="relative">
          <AccountIcon size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <select
            value={accountType}
            onChange={(e) => setAccountType(e.target.value as 'public' | 'private')} // ✅ assert
            className="bg-dark text-light w-[98%] pl-10 pr-4 py-2 border border-slate-300 rounded-[4px] focus:outline-none focus:ring-2 focus:ring-blue-200 appearance-none"
          >
            <option value="public">Public</option>
            <option value="private">Private</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default ProfessionAndAccoutType;