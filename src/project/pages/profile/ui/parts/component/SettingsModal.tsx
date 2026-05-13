// SettingsModal.tsx
import { useState, useEffect, useRef } from 'react';
import { X, User, ChevronRight } from 'lucide-react';
import MyAccountModal from './myAccount/MyAccountModal';
import PrivacyChoices from './myAccount/privacy';
import ToggleButton from '../../../../../freatures/toggle-theme/ui/ThemeToggle';
import { useSelector } from 'react-redux';
import { useAuth } from '../../../../../../apis/user/authentication/AuthContext';
import { useNavigate } from 'react-router-dom'; 
import { useUpdateMyProfile } from '../../../../../../apis/user/profile/hooks';
import { RootState } from '../../../../../entities/store';

const ANIMATION_DURATION = 300;

const SettingsModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const { myProfile, logout } = useAuth();
  const updateMyProfileMutation = useUpdateMyProfile();
  const darkmode = useSelector((state: RootState) => state.theme.isDark);
  const modalRef = useRef<HTMLDivElement>(null);
  const [isMyAccountOpen, setIsMyAccountOpen] = useState(false);
  const [isPrivacyExpanded, setIsPrivacyExpanded] = useState(false);
  const [accountType, setAccountType] = useState<'public' | 'private'>('public');
  const [language, setLanguage] = useState<'en' | 'es' | 'fr'>('en');
  const navigate = useNavigate();
  // Sync with profile when loaded
  useEffect(() => {
    if (myProfile) {
      setAccountType(myProfile.account_type);
      setLanguage((myProfile.language as 'en' | 'es' | 'fr') || 'en');
    }
  }, [myProfile]);

  // Reset sub-modals when main modal closes
  useEffect(() => {
    if (!isOpen) {
      setIsMyAccountOpen(false);
      setIsPrivacyExpanded(false);
    }
  }, [isOpen]);

  // Close on outside click (unless in MyAccount)
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (isMyAccountOpen) return;
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose, isMyAccountOpen]);

  const openMyAccount = () => setIsMyAccountOpen(true);
  const closeMyAccount = () => setIsMyAccountOpen(false);
  const togglePrivacy = () => setIsPrivacyExpanded(!isPrivacyExpanded);

  // Update account type via API
  const handleAccountTypeChange = async (type: 'public' | 'private') => {
    if (!myProfile) return;
    setAccountType(type);
    try {
      await updateMyProfileMutation.mutateAsync({ account_type: type });
    } catch (err) {
      // Revert on error (optional)
      setAccountType(myProfile.account_type);
      console.error('Failed to update account type:', err);
    }
  };

  // Update language via API
  const handleLanguageChange = async (lang: 'en' | 'es' | 'fr') => {
    if (!myProfile) return;
    setLanguage(lang);
    try {
      await updateMyProfileMutation.mutateAsync({ language: lang });
    } catch (err) {
      // Revert on error (optional)
      setLanguage((myProfile.language as 'en' | 'es' | 'fr') || 'en');
      console.error('Failed to update language:', err);
    }
  };
  const handleLogout = async () => {
  try {
    await logout(); // Clear session via API
    navigate('/authentication'); // Redirect after logout
  } catch (error) {
    console.error('Logout failed:', error);
    // Optionally still redirect if backend clears cookies anyway
    navigate('/authentication');
  }
};
  return (
    <>
      <div
        className={`fixed inset-0 z-30 transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onWheel={(e) => e.stopPropagation()}
        onTouchMove={(e) => e.stopPropagation()}
      >
        <div className={`absolute inset-0 ${darkmode ? 'bg-dark/90' : 'bg-light/95'}`} />

        <div
          ref={modalRef}
          className={`absolute top-0 right-0 h-full w-full sm:w-[40%] ${
            darkmode ? 'bg-dark_primary2 text-white' : 'bg-light text-dark'
          } transform transition-transform duration-${ANIMATION_DURATION} ease-in-out ${
            isOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          {isMyAccountOpen ? (
            <MyAccountModal onClose={closeMyAccount} />
          ) : (
            <>
              <div className="flex justify-between items-center p-5 border-b border-gray-800">
                <h2 className="text-xl font-bold">Settings</h2>
                <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-800">
                  <X size={22} />
                </button>
              </div>

              <div className="p-2 overflow-y-auto h-[calc(100vh-88px)]">
                <div
                  className="flex items-center gap-3 py-3 my-2 px-4 cursor-pointer"
                  onClick={openMyAccount}
                >
                  <User size={20} />
                  <div className="w-full">
                    <h3 className="font-semibold">My Account</h3>
                    <p className="text-sm">Passwords, Security, Personal info...</p>
                  </div>
                  <ChevronRight size={20} />
                </div>

                {/* Privacy Section */}
                <PrivacyChoices
                  isExpanded={isPrivacyExpanded}
                  onToggle={togglePrivacy}
                  accountType={accountType}
                  onAccountTypeChange={handleAccountTypeChange}
                />

                {/* Theme Toggle */}
                <div className="border-t border-gray-800">
                  <div className="flex items-center justify-between py-3 px-4">
                    <span>Theme</span>
                    <ToggleButton />
                  </div>
                </div>

                {/* Language Selection */}
                <div className="border-t border-gray-800">
                  <div className="flex items-center justify-between py-3 px-4">
                    <span>Language</span>
                    <select
                      className={`px-3 py-1 rounded-md text-sm cursor-pointer border ${
                        darkmode
                          ? 'bg-dark_primary2 text-white border-gray-700'
                          : 'bg-light text-dark border-gray-300'
                      } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      value={language}
                      onChange={(e) =>
                        handleLanguageChange(e.target.value as 'en' | 'es' | 'fr')
                      }
                    >
                      <option value="en">English</option>
                      <option value="es">Spanish</option>
                      <option value="fr">French</option>
                    </select>
                  </div>
                </div>

                <div className="py-3 px-4">
                  <button
                      onClick={handleLogout}
                      className="text-red-500 font-medium hover:text-red-400"
                    >
                      Log out
                    </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default SettingsModal;