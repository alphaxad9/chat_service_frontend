// EditProfileModal.tsx
import { useState, useEffect, useRef, useCallback } from 'react';
import { X, Edit, Trash2 } from 'lucide-react';
import { RootState } from '../../../../../entities/store';
import { useSelector } from 'react-redux';
import ProfileEdidForms from './forms';
import { UpdateProfileFormData } from '../../../../../../modules/user/authentication/types/auth';
import { useUpdateMyProfile } from '../../../../../../apis/user/profile/hooks';
import { UpdateProfileRequest } from '../../../../../../apis/user/profile/types';
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
  const updateProfileMutation = useUpdateProfile();       // user fields
const updateMyProfileMutation = useUpdateMyProfile(); 
  const darkmode = useSelector((state: RootState) => state.theme.isDark);
  const [bio, setBio] = useState(initialData.bio || '');
  const [first_name, setFirstName] = useState(initialData.first_name || '');
  const [last_name, setLastName] = useState(initialData.last_name || '');
  const [profession, setProfession] = useState(initialData.profession || '');
  const [location, setLocation] = useState(initialData.location || '');
  const [phone, setPhone] = useState<string | null>(initialData.phone || null);
  const [profileImage, setProfileImage] = useState<string | null>(initialData.profileImage || null);
  const [coverImage, setCoverImage] = useState<string | null>(initialData.coverImage || null);

  const profileImageInputRef = useRef<HTMLInputElement>(null);
  const coverImageInputRef = useRef<HTMLInputElement>(null);

  const touchStartY = useRef(0);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setBio(initialData.bio || '');
      setFirstName(initialData.first_name || "");
      setLastName(initialData.last_name || '');
      setProfession(initialData.profession || '');
      setLocation(initialData.location || '');
      setPhone(initialData.phone || '');
      setProfileImage(initialData.profileImage || null);
      setCoverImage(initialData.coverImage || null);
    }
  }, [initialData, isOpen]);

  // 📱 Swipe Down to Close (only when scrolled to top)
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
}, [onClose]); // ← only dependency is onClose

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

  const handleSave = async () => {
  // 1. Prepare user payload (first_name, last_name, profilePicture)
  const userPayload: UpdateProfileFormData = {
    first_name: first_name || '',
    last_name: last_name || '',
    profilePicture: profileImage ?? null,
  };

  // 2. Prepare profile payload
    const profilePayload: UpdateProfileRequest = {
      bio: bio || null,
      profession: profession || null,
      location: location || null,
      phone: phone || null,
    };

    // Optional: if you support cover_image editing in this modal, add it:
    if (coverImage !== initialData.coverImage) {
      profilePayload.cover_image = coverImage; // assuming your API accepts base64 or URL
    }

    try {
      await Promise.all([
        updateProfileMutation.mutateAsync(userPayload),
        updateMyProfileMutation.mutateAsync(profilePayload),
      ]);
      onSave(); // notify parent (e.g., to refetch or close)
    } catch (error) {
      console.error('Failed to update profile:', error);
      // Optionally show error toast
    }
  };

  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setProfileImage(url);
    }
  };

  const handleCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setCoverImage(url);
    }
  };

  const removeProfileImage = () => {
    setProfileImage(null);
    if (profileImageInputRef.current) profileImageInputRef.current.value = '';
  };

  const removeCoverImage = () => {
    setCoverImage(null);
    if (coverImageInputRef.current) coverImageInputRef.current.value = '';
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

          {/* === COVER IMAGE === */}
          <div className="relative h-32 w-full -mx-5 px-5 overflow-hidden">
            {coverImage ? (
              <img src={coverImage} alt="Cover" className="w-full h-full object-cover" />
            ) : (
              <div className={`w-full h-full ${darkmode ? 'bg-gray-800' : 'bg-gray-300'}`}></div>
            )}

            {/* Cover Edit/Delete Controls */}
            <div className="absolute top-2 right-2 flex gap-2">
              <button
                onClick={() => coverImageInputRef.current?.click()}
                className="p-1.5 bg-black/60 backdrop-blur rounded-full hover:bg-black/80 transition-colors"
                aria-label="Edit cover photo"
              >
                <Edit size={16} className="text-white" />
              </button>
              {coverImage && (
                <button
                  onClick={removeCoverImage}
                  className="p-1.5 bg-black/60 backdrop-blur rounded-full hover:bg-red-500/80 transition-colors"
                  aria-label="Delete cover photo"
                >
                  <Trash2 size={16} className="text-white" />
                </button>
              )}
            </div>
          </div>

          {/* === PROFILE IMAGE (overlapping cover bottom) === */}
          <div className="relative flex justify-center -mt-12 z-10 mb-6">
            <div className="relative">
              {profileImage ? (
                <img
                  src={profileImage}
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
                {profileImage && (
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