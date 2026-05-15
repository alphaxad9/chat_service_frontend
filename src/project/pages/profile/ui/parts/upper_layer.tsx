// UpperLayer.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // 👈 Add this
import { Settings, ArrowLeft } from 'lucide-react'; // 👈 Add ArrowLeft
import SettingsModal from './component/SettingsModal';

interface UpperLayerProps {
  coverImage: string | null;
  user: {
    id: string;
    username: string;
    first_name: string | null;
    last_name: string | null;
    profile_picture: string | null;
  };
}

const UpperLayer = ({ user }: UpperLayerProps) => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const navigate = useNavigate(); // 👈 Initialize navigate

  const openSettings = () => setIsSettingsOpen(true);
  const closeSettings = () => setIsSettingsOpen(false);
  const goHome = () => navigate('/'); // 👈 Navigate handler
  
  // Get first letter of username (fallback to 'U' if empty)
  const initial = user.username
    ? user.username.charAt(0).toUpperCase()
    : 'U';

  // Get display name
  const displayName = (user.first_name || user.last_name)
    ? `${user.first_name || ''} ${user.last_name || ''}`.trim()
    : user.username;

  return (
    <div className="h-[50%] relative">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent"></div>

      {/* Top Bar: Back Arrow + Settings */}
      <div className="absolute top-4 left-6 flex items-center gap-3 z-10">
        {/* Back Arrow Button */}
        <button
          onClick={goHome}
          className="p-2 rounded-full bg-black/50 backdrop-blur-sm cursor-pointer hover:bg-black/70 transition-colors focus:outline-none focus:ring-2 focus:ring-white/50"
          aria-label="Go back to home"
        >
          <ArrowLeft className="text-white" size={20} />
        </button>

        {/* Settings Icon */}
        <button
          onClick={openSettings}
          className="p-2 rounded-full bg-black/50 backdrop-blur-sm cursor-pointer hover:bg-black/70 transition-colors focus:outline-none focus:ring-2 focus:ring-white/50"
          aria-label="Open settings"
        >
          <Settings className="text-white" size={20} />
        </button>
      </div>

      {/* Centered Content: Avatar + Name */}
      <div className="absolute inset-0 flex flex-col items-center justify-center mt-10">
        {/* Profile Avatar */}
        {user.profile_picture ? (
          <img
            src={user.profile_picture}
            alt={`${user.username} profile`}
            className="w-24 h-24 rounded-full border-4 border-white object-cover shadow-lg"
          />
        ) : (
          <div className="w-24 h-24 rounded-full border-4 border-white bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
            <span className="text-white text-2xl font-bold">
              {initial}
            </span>
          </div>
        )}

        {/* User Name & Handle - Below Avatar */}
        <div className="mt-4 text-center text-white">
          <h1 className="text-2xl font-bold">{displayName}</h1>
          <p className="text-gray-300">@{user.username}</p>
        </div>
      </div>

      <SettingsModal isOpen={isSettingsOpen} onClose={closeSettings} />
    </div>
  );
};

export default UpperLayer;