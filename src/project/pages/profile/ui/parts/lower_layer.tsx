// LowerLayer.tsx
import { Briefcase, MapPin, Phone } from "lucide-react";

interface LowerLayerProps {
  bio: string | null;
  profession: string | null;
  location: string | null;
  phone: string | null;
  followers_count: number;
  following_count: number;
  toggleFollow: () => void;
}

const LowerLayer = ({ 
  bio, 
  profession, 
  location, 
  phone, 
  toggleFollow 
}: LowerLayerProps) => {
  return (
    <div className="px-5 pb-4 pt-2">
      {/* Centered Content Container */}
      <div className="flex flex-col items-center text-center max-w-2xl mx-auto">


        {/* Edit Profile Button - Centered */}
        <div className="mb-5 w-full flex justify-center">
          <button
            onClick={toggleFollow}
            className="py-2.5 px-6 rounded-lg font-semibold text-sm transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black bg-light text-dark hover:bg-gray-700 focus:ring-gray-600"
          >
            Edit Profile
          </button>
        </div>

        {/* Bio - Centered */}
        {bio && (
          <p className="text-gray-300 leading-relaxed text-sm mb-5 max-w-prose">
            {bio}
          </p>
        )}

        {/* Details Grid - Centered Items */}
        <div className="flex flex-wrap justify-center gap-x-8 gap-y-3 text-sm">
          {phone && (
            <div className="flex items-center gap-2">
              <Phone className="text-gray-500 flex-shrink-0" size={16} />
              <span className="text-gray-300">{phone}</span>
            </div>
          )}
          {profession && (
            <div className="flex items-center gap-2">
              <Briefcase className="text-gray-500 flex-shrink-0" size={16} />
              <span className="text-gray-300">{profession}</span>
            </div>
          )}
          {location && (
            <div className="flex items-center gap-2">
              <MapPin className="text-gray-500 flex-shrink-0" size={16} />
              <span className="text-gray-300">{location}</span>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default LowerLayer;