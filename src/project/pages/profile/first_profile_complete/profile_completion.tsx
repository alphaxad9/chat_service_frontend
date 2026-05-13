// src/project/pages/profile/first_profile_complete/profile_completion/index.tsx

import FillSmallScreen from "./small_screen/fullfill_profile";
import FillLargeScreen from "./large_screen/full_ask_screen";

const FirstProfileCompletion = () => {
  return (
    <div className="bg-dark text-light h-full min-h-screen w-screen flex items-center justify-center">
      <div className="hidden md_profile_complete:block">
        <FillLargeScreen />
      </div>
      <div className="md_profile_complete:hidden">
        <FillSmallScreen />
      </div>
    </div>
  );
};

export default FirstProfileCompletion;
