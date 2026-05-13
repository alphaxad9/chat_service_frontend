// src/store/store.ts
import { configureStore } from '@reduxjs/toolkit';
import completeProfileFormReducer from "./ui/model/completeProfileFormSlice";
import authUiReducer from '../freatures/login_and_register/state/authUiSlice'
import themeReducer from './ui/model/uiSlice';
import  sectionReducer  from '../pages/profile/lib/state/completeProfileSlice';
export const store = configureStore({
  reducer: {
    authUi: authUiReducer,
    theme: themeReducer,
    section: sectionReducer,
    completeProfileForm: completeProfileFormReducer

  },
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;