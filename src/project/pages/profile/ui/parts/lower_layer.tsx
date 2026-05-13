// LowerLayer.tsx
import { Briefcase, MapPin, Phone } from "lucide-react";

interface LowerLayerProps {
  bio: string | null;
  profession: string | null;
  location: string | null;
  phone: string | null; // 👈 added
  followers_count: number;
  following_count: number;
  toggleFollow: () => void;
}

const LowerLayer = ({ 
  bio, 
  profession, 
  location, 
  phone, // 👈 destructured
  followers_count, 
  following_count, 
  toggleFollow 
}: LowerLayerProps) => {
  return (
    <div className="px-5 pb-2 pt-2">
      <div className="flex flex-col md:flex-row gap-8 md:gap-10">
        {/* LEFT COLUMN: Stats + Buttons in rows */}
        <div className="md:w-1/3 flex flex-col gap-2">
          {/* Stats Row */}
<div className="flex justify-between gap-3">
  <div className="text-center flex-1">
    <div className="text-lg font-bold text-white">{followers_count.toLocaleString()}</div>
    <div className="text-gray-500 text-sm mt-1">Followers</div>
  </div>
  <div className="text-center flex-1">
    <div className="text-lg font-bold text-white">{following_count.toLocaleString()}</div>
    <div className="text-gray-500 text-sm mt-1">Following</div>
  </div>
  <div className="text-center flex-1">
    <div className="text-lg font-bold text-white">32</div>
    <div className="text-gray-500 text-sm mt-1">Posts</div>
  </div>
</div>

          {/* Buttons Row */}
          <div className="flex gap-5">
            <button
              onClick={toggleFollow}
              className={`flex-1 py-2.5 px-3 rounded-lg font-semibold text-sm transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black bg-light text-dark hover:bg-gray-700 focus:ring-gray-600
              `}
            >
            Edit Profile
            </button>
        
          </div>
        </div>

        {/* RIGHT COLUMN: Bio + Details */}
        <div className="md:w-2/3 flex flex-col gap-2">
          {bio && (
            <p className="text-gray-300 leading-relaxed text-sm">
              {bio}
            </p>
          )}

         <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
  {phone && (
    <div className="flex items-start gap-2.5">
      <Phone className="text-gray-500 mt-0.5 flex-shrink-0" size={16} />
      <span className="text-gray-300 text-sm">{phone}</span>
    </div>
  )}
  {profession && (
    <div className="flex items-start gap-2.5">
      <Briefcase className="text-gray-500 mt-0.5 flex-shrink-0" size={16} />
      <span className="text-gray-300 text-sm">{profession}</span>
    </div>
  )}
  {location && (
    <div className="flex items-start gap-2.5 md:col-span-1">
      <MapPin className="text-gray-500 mt-0.5 flex-shrink-0" size={16} />
      <span className="text-gray-300 text-sm">{location}</span>
    </div>
  )}
</div>
        </div>
      </div>
    </div>
  );
};

export default LowerLayer;