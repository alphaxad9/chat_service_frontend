// UpperLayer.tsx
import { useState } from 'react';
import { Settings } from 'lucide-react';
import SettingsModal from './component/SettingsModal';

interface UpperLayerProps {
  coverImage: string | null;
  user: {
    id: string;
    username: string;
    first_name: string | null;
    last_name: string | null;
    profilePicture: string | null;
  };
}

const UpperLayer = ({ coverImage, user }: UpperLayerProps) => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const openSettings = () => setIsSettingsOpen(true);
  const closeSettings = () => setIsSettingsOpen(false);

  // Get first letter of username (fallback to 'U' if empty)
  const initial = user.username
    ? user.username.charAt(0).toUpperCase()
    : 'U';

  return (
    <div className="h-[30%] relative">
      {coverImage ? (
        <img
          src={coverImage}
          alt="Cover"
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : (
        <div className="absolute inset-0 bg-gray-900"></div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent"></div>

      {/* Settings Icon - Top Left */}
      <div
        className="absolute top-4 left-6 p-2 rounded-full bg-black/50 backdrop-blur-sm cursor-pointer"
        onClick={openSettings}
      >
        <Settings className="text-white" size={20} />
      </div>

      {/* User Name & Handle */}
      <div className="absolute bottom-4 left-6 text-white max-w-xs">
        <h1 className="text-2xl font-bold">
          {(user.first_name || user.last_name)
            ? `${user.first_name || ''} ${user.last_name || ''}`.trim()
            : user.username}
        </h1>
        <p className="text-gray-300">@{user.username}</p>
      </div>

      {/* Profile Avatar */}
      <div className="absolute bottom-4 right-4">
        {user.profilePicture ? (
          <img
            src={user.profilePicture}
            alt={`${user.username} profile`}
            className="w-24 h-24 rounded-full border-4 border-white object-cover"
          />
        ) : (
          <div className="w-24 h-24 rounded-full border-4 border-white bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <span className="text-white text-2xl font-bold">
              {initial}
            </span>
          </div>
        )}
      </div>

      <SettingsModal isOpen={isSettingsOpen} onClose={closeSettings} />
    </div>
  );
};

export default UpperLayer;