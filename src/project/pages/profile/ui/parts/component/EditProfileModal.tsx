// src/components/EditProfileModal.tsx
import { useState, useEffect, useRef, useCallback } from 'react';
import { X, Edit, Trash2 } from 'lucide-react';
import { RootState } from '../../../../../entities/store';
import { useSelector } from 'react-redux';
import ProfileEdidForms from './forms';
import { UpdateProfileFormData } from '../../../../../../modules/user/authentication/types/auth';
import { useUpdateMyProfile } from '../../../../../../apis/user/profile/hooks';
import { useUpdateProfile } from '../../../../../../apis/user/authentication/Hooks';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  initialData: {
    bio: string | null;
    first_name: string | null;
    last_name: string | null;
    profession: string | null;
    location: string | null;
    phone: string | null;
    profileImage?: string | null;
    coverImage?: string | null;
  };
}

const EditProfileModal = ({ isOpen, onClose, onSave, initialData }: EditProfileModalProps) => {
  const updateProfileMutation = useUpdateProfile();       // handles first_name + profile_picture
  const updateMyProfileMutation = useUpdateMyProfile();   // handles bio, profession, etc.

  const darkmode = useSelector((state: RootState) => state.theme.isDark);

  // ─────────────────────────────────────────────────────────────
  // SEPARATE STATES: preview URL (for display) + File object (for upload)
  // ─────────────────────────────────────────────────────────────
  const [bio, setBio] = useState(initialData.bio || '');
  const [first_name, setFirstName] = useState(initialData.first_name || '');
  const [last_name, setLastName] = useState(initialData.last_name || '');
  const [profession, setProfession] = useState(initialData.profession || '');
  const [location, setLocation] = useState(initialData.location || '');
  const [phone, setPhone] = useState<string | null>(initialData.phone || null);

  // Profile image: preview string + actual File
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(initialData.profileImage || null);
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);

  // Cover image: preview string + actual File
  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(initialData.coverImage || null);
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);

  const profileImageInputRef = useRef<HTMLInputElement>(null);
  const coverImageInputRef = useRef<HTMLInputElement>(null);

  const touchStartY = useRef(0);
  const modalRef = useRef<HTMLDivElement>(null);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setBio(initialData.bio || '');
      setFirstName(initialData.first_name || '');
      setLastName(initialData.last_name || '');
      setProfession(initialData.profession || '');
      setLocation(initialData.location || '');
      setPhone(initialData.phone || null);
      setProfileImagePreview(initialData.profileImage || null);
      setProfileImageFile(null);
      setCoverImagePreview(initialData.coverImage || null);
      setCoverImageFile(null);
    }
  }, [initialData, isOpen]);

  // ─────────────────────────────────────────────────────────────
  // 📱 Swipe Down to Close (only when scrolled to top)
  // ─────────────────────────────────────────────────────────────
  const handleTouchStart = (e: TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchMove = () => {};

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    const touchY = e.changedTouches[0].clientY;
    const deltaY = touchY - touchStartY.current;

    const startedNearTop = touchStartY.current < 150;
    const pulledDownFarEnough = deltaY > 80;

    const scrollable = modalRef.current?.querySelector('.scrollable-content') as HTMLElement | null;
    const isAtTop = !scrollable || scrollable.scrollTop === 0;

    if (isAtTop && startedNearTop && pulledDownFarEnough) {
      onClose();
    }
  }, [onClose]);

  useEffect(() => {
    const modal = modalRef.current;
    if (!modal) return;

    if (isOpen) {
      modal.addEventListener('touchstart', handleTouchStart, { passive: true });
      modal.addEventListener('touchmove', handleTouchMove, { passive: false });
      modal.addEventListener('touchend', handleTouchEnd, { passive: true });
    }

    return () => {
      modal.removeEventListener('touchstart', handleTouchStart);
      modal.removeEventListener('touchmove', handleTouchMove);
      modal.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isOpen, handleTouchEnd]);

  // ─────────────────────────────────────────────────────────────
  // 🖼️ File handlers: store BOTH preview URL + real File object
  // ─────────────────────────────────────────────────────────────
  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfileImageFile(file);  // ← REAL File for upload
      setProfileImagePreview(URL.createObjectURL(file));  // ← Preview for UI
    }
  };

  const handleCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverImageFile(file);
      setCoverImagePreview(URL.createObjectURL(file));
    }
  };

  const removeProfileImage = () => {
    setProfileImagePreview(null);
    setProfileImageFile(null);
    if (profileImageInputRef.current) profileImageInputRef.current.value = '';
  };

  const removeCoverImage = () => {
    setCoverImagePreview(null);
    setCoverImageFile(null);
    if (coverImageInputRef.current) coverImageInputRef.current.value = '';
  };

  // ─────────────────────────────────────────────────────────────
  // 💾 Save: Submit REAL file via FormData (exactly like your curl)
  // ─────────────────────────────────────────────────────────────
  const handleSave = async () => {
    try {
      // 1. Prepare FormData for User model (first_name, last_name, profile_picture)
      const userFormData = new FormData();
      userFormData.append('first_name', first_name || '');
      userFormData.append('last_name', last_name || '');

      if (profileImageFile) {
        // ← Append actual File object (this becomes request.FILES['profile_picture'])
        userFormData.append('profile_picture', profileImageFile);
      } else if (profileImagePreview === null && initialData.profileImage) {
        // User explicitly removed the image → send empty string to clear it
        userFormData.append('profile_picture', '');
      }
      // If profileImageFile is null but preview still exists, we keep existing image (don't send field)

      // 2. Prepare JSON payload for Profile model (bio, profession, location, phone)
      const profilePayload = {
        bio: bio || null,
        profession: profession || null,
        location: location || null,
        phone: phone || null,
      };

      // 3. Execute both mutations in parallel
      // 🔑 Type assertion to satisfy TypeScript (FormData is compatible at runtime)
      await Promise.all([
        updateProfileMutation.mutateAsync(userFormData as unknown as UpdateProfileFormData),
        updateMyProfileMutation.mutateAsync(profilePayload),
      ]);

      console.log('✅ Profile updated successfully (file uploaded)');
      onSave(); // Notify parent to refetch or close
    } catch (error) {
      console.error('Failed to update profile:', error);
      // Optionally show error toast here
    }
  };

  return (
    <div
      className={`absolute inset-0 z-20 transition-opacity duration-300 ${
        isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`}
      onWheel={(e) => e.stopPropagation()}
      onTouchMove={(e) => e.stopPropagation()}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />

      {/* Modal Panel */}
      <div
        ref={modalRef}
        className={`absolute bottom-0 left-0 right-0 ${
          darkmode ? 'bg-dark_primary2 text-white' : 'bg-light text-dark'
        } rounded-t-2xl transform transition-transform duration-[1800ms] ease-[cubic-bezier(0.23,1,0.32,1)] ${
          isOpen ? 'translate-y-0' : 'translate-y-full'
        }`}
        style={{ height: '90vh' }}
      >
        {/* Scrollable Content Area */}
        <div
          className="scrollable-content px-5 pb-28 overflow-y-auto"
          style={{ height: 'calc(90vh - 72px)', maxHeight: 'calc(90vh - 72px)' }}
        >
          {/* === HEADER === */}
          <div className={`flex justify-between items-center py-4 -mx-5 px-5 sticky top-0 z-10 ${darkmode ? "bg-dark text-white" : "bg-light text-dark"}`}>
            <h2 className="text-xl font-bold">Edit Profile</h2>
            <button onClick={onClose} aria-label="Close">
              <X size={22} />
            </button>
          </div>
          {/* === PROFILE IMAGE (overlapping cover bottom) === */}
          <div className="relative flex justify-center -mt-12 z-10 mb-6">
            <div className="relative">
              {profileImagePreview ? (
                <img
                  src={profileImagePreview}
                  alt="Profile"
                  className="w-24 h-24 rounded-full border-4 border-white object-cover shadow-lg"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gray-500 border-4 border-white"></div>
              )}

              {/* Profile Edit/Delete Controls */}
              <div className="absolute bottom-0 right-0 flex gap-1">
                <button
                  onClick={() => profileImageInputRef.current?.click()}
                  className="p-1 bg-black/60 rounded-full hover:bg-black/80 transition-colors"
                  aria-label="Edit profile photo"
                >
                  <Edit size={14} className="text-white" />
                </button>
                {profileImagePreview && (
                  <button
                    onClick={removeProfileImage}
                    className="p-1 bg-black/60 rounded-full hover:bg-red-500/80 transition-colors"
                    aria-label="Delete profile photo"
                  >
                    <Trash2 size={14} className="text-white" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* === FORM CONTENT === */}
          <ProfileEdidForms
            bio={bio}
            first_name={first_name}
            phone={phone ?? undefined}
            setPhone={(value) => setPhone(value ?? null)}
            last_name={last_name}
            profession={profession}
            location={location}
            setBio={setBio}
            setFirstName={setFirstName}
            setLastName={setLastName}
            setProfession={setProfession}
            setLocation={setLocation}
          />
        </div>

        {/* Hidden file inputs */}
        <input
          type="file"
          ref={coverImageInputRef}
          onChange={handleCoverImageChange}
          accept="image/*"
          className="hidden"
        />
        <input
          type="file"
          ref={profileImageInputRef}
          onChange={handleProfileImageChange}
          accept="image/*"
          className="hidden"
        />

        {/* === STICKY SAVE BUTTON === */}
        <div
          className={`absolute bottom-0 left-0 right-0 p-5 border-t ${
            darkmode ? 'border-gray-800 bg-dark_primary2' : 'border-gray-200 bg-light'
          }`}
        >
          <button
            onClick={handleSave}
            className={`${darkmode ? "bg-light text-dark" : "bg-dark text-light"} w-full py-3 rounded-lg font-medium hover:bg-blue-700 transition`}
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditProfileModal;