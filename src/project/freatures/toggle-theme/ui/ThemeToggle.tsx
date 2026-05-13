// ToggleButton.tsx
import React, { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { toggleTheme } from "../../../entities/ui/model/uiSlice";
import { RootState } from '../../../entities/store';
import { useAuth } from '../../../../apis/user/authentication/AuthContext';
import { useUpdateMyProfile } from '../../../../apis/user/profile/hooks';

const ToggleButton: React.FC = () => {
  const { myProfile } = useAuth();
  const updateMyProfileMutation = useUpdateMyProfile();
  const dispatch = useDispatch();
  const darkmode = useSelector((state: RootState) => state.theme.isDark);
  const [initialized, setInitialized] = useState(false);

  // Sync Redux + localStorage with profile's theme ONCE when profile loads
  useEffect(() => {
    if (myProfile?.theme && !initialized) {
      let shouldUseDark: boolean;

      if (myProfile.theme === 'system') {
        // Default to dark for "system" (as per your requirement)
        shouldUseDark = true;
      } else {
        shouldUseDark = myProfile.theme === 'dark';
      }

      dispatch(toggleTheme()); // force update if mismatch
      // But better: use setTheme to avoid unnecessary toggle
      // We'll adjust uiSlice usage below 👇

      // Actually, let's use setTheme for precision:
      dispatch({ type: 'theme/setTheme', payload: shouldUseDark });
      setInitialized(true);
    }
  }, [myProfile, dispatch, initialized]);

  const handleToggle = async () => {
    const newIsDark = !darkmode;
    const newThemeValue = newIsDark ? 'dark' : 'light';

    // 1. Update Redux + localStorage
    dispatch(toggleTheme());

    // 2. Update backend profile
    if (myProfile) {
      try {
        await updateMyProfileMutation.mutateAsync({ theme: newThemeValue });
      } catch (err) {
        console.error('Failed to update theme in profile:', err);
        // Optional: revert UI? (not done here for simplicity)
      }
    }
  };

  return (
    <button
      onClick={handleToggle}
      className="p-2 hover:bg-myhover rounded-full transition-colors"
    >
      {darkmode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
    </button>
  );
};

export default ToggleButton;