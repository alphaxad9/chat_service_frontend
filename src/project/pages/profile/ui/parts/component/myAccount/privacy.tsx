// PrivacyChoices.tsx
import { ChevronRight } from 'lucide-react';

interface PrivacyChoicesProps {
  isExpanded: boolean;
  onToggle: () => void;
  accountType: 'public' | 'private';
  onAccountTypeChange: (type: 'public' | 'private') => void;
}

const PrivacyChoices: React.FC<PrivacyChoicesProps> = ({
  isExpanded,
  onToggle,
  accountType,
  onAccountTypeChange,
}) => {
  const isPrivate = accountType === 'private';

  const handleSwitch = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    const newType = e.target.checked ? 'private' : 'public';
    onAccountTypeChange(newType);
  };

  return (
    <div className="border-t border-gray-800">
      {/* Header */}
      <div
        className="flex justify-between items-center py-3 px-4 cursor-pointer"
        onClick={onToggle}
      >
        <div className="flex items-center gap-2">
          <span>Account Privacy</span>
        </div>

        <ChevronRight
          size={20}
          className={`transition-transform duration-300 ${
            isExpanded ? 'rotate-90' : 'rotate-0'
          }`}
        />
      </div>

      {/* Expandable Panel */}
      <div
        className={`transition-all duration-300 ease-in-out overflow-hidden ${
          isExpanded ? 'max-h-52 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="px-4 py-3 space-y-3">
          {/* Toggle Row */}
          <div className="flex justify-between items-center">
            <span className="text-sm">Private account</span>

            {/* Switch */}
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                onChange={handleSwitch}
                checked={isPrivate}
              />
              <div className="w-11 h-6 bg-gray-400 peer-focus:outline-none rounded-full peer peer-checked:bg-blue-600 transition-colors" />
              <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-5" />
            </label>
          </div>

          {/* Description */}
          <p className="text-xs text-gray-400 leading-relaxed">
            When your account is private, only people you approve can follow you and
            see your posts, designs, or activity.  
            Public accounts are fully visible to everyone.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PrivacyChoices;