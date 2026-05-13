// myAccount/MyAccountModal.tsx
import { useEffect, useRef, useState, useCallback } from 'react';
import { useAuth } from '../../../../../../../apis/user/authentication/AuthContext';
import { X } from 'lucide-react';
import { EditableField, PasswordEditableField, DeleteAccountSection } from './helpers/editableFields';
import { useSelector } from 'react-redux';
import { RootState } from '../../../../../../entities/store';
import { useChangeUsername, useChangePassword, useDeleteAccount, useChangeEmail } from '../../../../../../../apis/user/authentication/Hooks';
interface MyAccountModalProps {
  onClose: () => void;
}

const MyAccountModal = ({ onClose }: MyAccountModalProps) => {
  const { myProfile, profile } = useAuth();
  const changeUsernameMutation = useChangeUsername();
  const changePasswordMutation = useChangePassword();
  const deleteAccountMutation = useDeleteAccount()
  const changeEmailMutation = useChangeEmail()
  const darkmode = useSelector((state: RootState) => state.theme.isDark);
  const modalRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const touchStartY = useRef(0);
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);


  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  const handleTouchStart = (e: TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = useCallback((e: TouchEvent) => {
  const touchY = e.changedTouches[0].clientY;
  const deltaY = touchY - touchStartY.current;

  const startedNearTop = touchStartY.current < 150;
  const pulledDownFarEnough = deltaY > 80;

  const scrollable = modalRef.current?.querySelector('.scrollable-account') as HTMLElement | null;
  const isAtTop = !scrollable || scrollable.scrollTop === 0;

  if (isAtTop && startedNearTop && pulledDownFarEnough) {
    setIsVisible(false);
    setTimeout(onClose, 600);
  }
}, [onClose]); // ← only real dependency is onClose

  useEffect(() => {
    const modal = modalRef.current;
    if (!modal) return;

    modal.addEventListener('touchstart', handleTouchStart, { passive: true });
    modal.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      modal.removeEventListener('touchstart', handleTouchStart);
      modal.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchEnd]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 600);
  };
  const handleEmailSave = async (newEmail: string, password?: string) => {
  if (!password) {
    setEmailError('Password is required');
    return;
  }

  try {
    setEmailError(null);
    await changeEmailMutation.mutateAsync({
      new_email: newEmail,
      password: password,
    });
  } catch (error: any) {
    const message =
      error?.response?.data?.detail ||
      error?.response?.data?.new_email?.[0] ||
      error?.response?.data?.password?.[0] ||
      'Failed to update email';
    setEmailError(message);
  }
};
  const handleDeleteAccount = async (password: string) => {
  try {
    setDeleteError(null);
    await deleteAccountMutation.mutateAsync({ password });
    
    // ✅ Success: Navigate to authentication page
    // We'll use window.location to fully reset state (since user is logged out)
    window.location.href = '/authentication';
    
    // Optionally: you could also use React Router's navigate,
    // but after account deletion, a full reload ensures clean state
  } catch (error: any) {
    const message =
      error?.response?.data?.detail ||
      error?.response?.data?.password?.[0] ||
      'Failed to delete account. Please check your password.';
    setDeleteError(message);
  }
};
  const handlePasswordSave = async (currentPassword: string, newPassword: string) => {
  try {
    setPasswordError(null);
    await changePasswordMutation.mutateAsync({
      current_password: currentPassword,
      new_password: newPassword,
      new_password2: newPassword, // since UI enforces match
    });
    // Optional: show success message or auto-close editor
  } catch (error: any) {
    const message =
      error?.response?.data?.detail ||
      error?.response?.data?.new_password?.[0] ||
      error?.response?.data?.current_password?.[0] ||
      'Failed to update password';
    setPasswordError(message);
  }
};
  const handleUsernameSave = async (newUsername: string, password?: string) => {
  if (!password) {
    // This should never happen when requiresPassword=true,
    // but TypeScript needs this for type safety
    setUsernameError('Password is required');
    return;
  }

  try {
    setUsernameError(null);
    await changeUsernameMutation.mutateAsync({
      new_username: newUsername,
      password: password, // ✅ now safe: password is string
    });
  } catch (error: any) {
    const message = error?.response?.data?.detail || 'Failed to update username';
    setUsernameError(message);
  }
};
  return (
    <div className="absolute inset-0 z-10 bg-gray-900 text-white">
      {/* Backdrop */}
      <div className={`absolute inset-0 ${
          darkmode ? 'bg-dark/90' : 'bg-light/95'
        } `} onClick={handleClose} />

      {/* Full-Height Sliding Panel */}
      <div
        ref={modalRef}
        className={`
          absolute bottom-0 left-0 right-0 top-0
          ${
          darkmode ? 'bg-dark_primary2 text-white' : 'bg-light text-dark'
        } rounded-t-2xl
          transition-transform duration-[600ms] ease-[cubic-bezier(0.23,1,0.32,1)]
          ${isVisible ? 'translate-y-0' : 'translate-y-full'}
        `}
      >
        {/* Header */}
        <div className={`sticky top-0 z-10 ${
          darkmode ? 'bg-dark_primary2 text-white' : 'bg-light text-dark'
        } px-5 py-4 border-b border-gray-800 flex justify-between items-center`}>
          <button onClick={handleClose} aria-label="Close">
            <X size={22}/>
          </button>
          <h2 className="text-xl font-bold">My Account</h2>
          <div className="w-6" />
        </div>

        {/* Scrollable Content — REPLACED WITH EDITABLE FIELDS */}
        <div className="scrollable-account px-5 pb-24 overflow-y-auto h-[calc(100%-72px)]">
          <div className="py-4 border-b border-gray-800">
  <h3 className="font-medium text-lg mb-3">Profile</h3>
        
        <EditableField
          label="Username"
          value={myProfile?.user.username ?? ''}
          requiresPassword={true}
          type="text"
          onSave={handleUsernameSave}
        />
        {usernameError && (
          <p className="text-red-500 text-xs mt-1 ml-3">{usernameError}</p>
        )}

        <EditableField
            label="Email"
            value={profile?.email ?? ''}
            requiresPassword={true}
            type="email"
            onSave={handleEmailSave}
          />
          {emailError && (
            <p className="text-red-500 text-xs mt-1 ml-3">{emailError}</p>
          )}
        
</div>

          <div className="py-4 border-b border-gray-800">
            <h3 className="font-medium text-lg mb-3">Security</h3>
            <PasswordEditableField onSave={handlePasswordSave} />
              {passwordError && (
                <p className="text-red-500 text-xs mt-1 ml-3">{passwordError}</p>
              )}
            {/* You can add 2FA and sessions here later */}
          </div>

                  <div className="py-4">
           
            <div className="flex items-start gap-3 py-3">
              <div className="mt-1 flex-shrink-0">
                {/* No icon, or you can use a Trash icon if you prefer */}
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-red-400">Delete Account</div>
                <p className="text-sm text-gray-400 mt-1">
                  Permanently delete your account and all data. This action cannot be undone.
                </p>
                <DeleteAccountSection onConfirmDelete={handleDeleteAccount} />
                  {deleteError && (
                    <p className="text-red-500 text-xs mt-2 ml-3">{deleteError}</p>
                  )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyAccountModal;