// LargeProfile.tsx
import { useState } from 'react';
import UpperLayer from './parts/upper_layer';
import LowerLayer from './parts/lower_layer';
import EditProfileModal from './parts/component/EditProfileModal';
import { useAuth } from '../../../../apis/user/authentication/AuthContext';
function LargeProfile() {
  const { myProfile} = useAuth();

  

  const [isEditing, setIsEditing] = useState(false);

  const openEdit = () => setIsEditing(true);
  const closeEdit = () => setIsEditing(false);

  const handleSaveProfile = () => {
    closeEdit();
  };

  return (
    <div className="h-screen bg-black text-white flex flex-col relative overflow-hidden">

      {/* 🔥 THIS WRAPS ALL SCROLLABLE CONTENT */}
      <div className="flex-1 overflow-y-auto">
        <UpperLayer
  coverImage={myProfile?.cover_image ?? null}
  user={myProfile?.user ?? {
    id: '',
    username: '',
    first_name: null,
    last_name: null,
    profile_picture: null,
  }}
/>

<LowerLayer
  bio={myProfile?.bio ?? null}
  profession={myProfile?.profession ?? null}
  location={myProfile?.location ?? null}
  phone={myProfile?.phone ?? null}
  followers_count={myProfile?.followers_count ?? 0}
  following_count={myProfile?.following_count ?? 0}
  toggleFollow={openEdit}
/>
        

       
      </div>

      {/* Modal is always mounted */}
     <EditProfileModal
  isOpen={isEditing}
  onClose={closeEdit}
  onSave={handleSaveProfile}
  initialData={{
    bio: myProfile?.bio ?? null,
    profession: myProfile?.profession ?? null,
    location: myProfile?.location ?? null,
    phone: myProfile?.phone ?? null,
    first_name: myProfile?.user.first_name ?? null,   
    last_name: myProfile?.user.last_name ?? null,
    profileImage: myProfile?.user.profile_picture ?? null,
    coverImage: myProfile?.cover_image ?? null,
  }}
/>
    </div>
  );
}

export default LargeProfile;
