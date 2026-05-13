import { useSelector } from 'react-redux';
import { useEffect, useState, useMemo } from 'react';
import { RootState } from '../../../../entities/store';
import { useAuth } from '../../../../../apis/user/authentication/AuthContext';
import { parseDate } from '../large_screen/helpers/helpers';
import AskUser from './pages/ask_user';
import SectionOne from './pages/section1';
import SectionTwo from './pages/section2';
import SectionThree from './pages/section3';
import { motion, AnimatePresence } from 'framer-motion';
import AuthLoader from '../../../../shared/ui/loader/authentication_loader';
import type { SmallScreenFormState } from '../large_screen/helpers/helpers';
import FullScreenLoader from '../../../../entities/ui/components/FullScreenLoader';
import { useDispatch } from 'react-redux';
import { setSection } from '../../lib/state/completeProfileSlice';
const FillSmallScreen = () => {
  const dispatch = useDispatch();

  const [formState, setFormState] = useState<SmallScreenFormState>({
    // Section 1
    phone: null,
    location: null,
    locationOption: null,
    cover_image: null,
    profileImage: null,

    // Section 2
    bio: null,
    profession: null,
    account_type: 'public',
    date_of_birth: null,
    gender: null,
    dateOfBirth: { day: '', month: '', year: '' },

    // Section 3
    first_name: '',
    last_name: '',
    theme: 'system',
    language: null,
    languageOption: null,
  });

  const { myProfile, isProfileLoading, profile, isAuthBooting, isMyProfileLoading } = useAuth();
  const currentSection = useSelector((state: RootState) => state.section.currentSection);

  // 🔁 Sync profile data only once when loaded
  useEffect(() => {
    if (myProfile && !isProfileLoading) {
      const dobParts = parseDate(myProfile.date_of_birth ?? '');

      setFormState((prev) => ({
        ...prev,
        // Section 1
        phone: myProfile.phone ?? null,
        location: myProfile.location ?? null,
        cover_image: myProfile.cover_image ?? null,
        profileImage: myProfile.user?.profilePicture ?? null,
        locationOption: myProfile.location
          ? { value: myProfile.location, label: myProfile.location }
          : null,

        // Section 2
        bio: myProfile.bio ?? null,
        profession: myProfile.profession ?? null,
        account_type: myProfile.account_type,
        date_of_birth: myProfile.date_of_birth,
        gender: myProfile.gender ?? null,
        dateOfBirth: dobParts,

        // Section 3
        first_name: myProfile.user?.first_name ?? '',
        last_name: myProfile.user?.last_name ?? '',
        theme: (myProfile.theme as 'light' | 'dark' | 'system') ?? 'system',
        language: myProfile.language ?? null,
        languageOption: myProfile.language
          ? { value: myProfile.language, label: myProfile.language }
          : null,
      }));
    }
  }, [myProfile, isProfileLoading]);

  // ✅ AUTO-ADVANCE: Skip section0 and go directly to section1 once auth is ready
  useEffect(() => {
    if (
      !isAuthBooting &&
      !isProfileLoading &&
      !isMyProfileLoading &&
      currentSection === 'section0'
    ) {
      dispatch(setSection('section1'));
    }
  }, [isAuthBooting, isProfileLoading, isMyProfileLoading, currentSection, dispatch]);

  // Memoize section rendering
  const renderSection = useMemo(() => {
    switch (currentSection) {
      case 'section0':
        return <AskUser />;
      case 'section1':
        return (
          <SectionOne
            key="section1"
            formState={formState}
            setFormState={setFormState}
            username={profile?.username}
            email={profile?.email}
          />
        );
      case 'section2':
        return (
          <SectionTwo
            key="section2"
            formState={formState}
            setFormState={setFormState}
          />
        );
      case 'section3':
        return (
          <SectionThree
            key="section3"
            formState={formState}
            setFormState={setFormState}
          />
        );
      default:
        return <AskUser />;
    }
  }, [currentSection, formState, profile?.username, profile?.email]);

  if (isAuthBooting || isProfileLoading || isMyProfileLoading) {
    return <FullScreenLoader />;
  }

  return (
    <div className="relative text-[0.8rem] bg-dark text-light h-full min-h-screen w-screen flex items-center justify-center">
      <AuthLoader />
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSection}
          initial={{ x: 200, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -200, opacity: 0 }}
          transition={{ type: 'tween', ease: 'easeInOut', duration: 0.25 }}
        >
          {renderSection}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default FillSmallScreen;