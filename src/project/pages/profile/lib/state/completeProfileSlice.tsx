// src/features/section/state/sectionSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface SectionState {
  currentSection: 'section0' | 'section1' | 'section2' | 'section3';
}

const initialState: SectionState = {
  currentSection: 'section0',
};

const sectionSlice = createSlice({
  name: 'section',
  initialState,
  reducers: {
    setSection: (state, action: PayloadAction<'section0' | 'section1' | 'section2' | 'section3'>) => {
      state.currentSection = action.payload;
    },
  },
});
export const { setSection } = sectionSlice.actions;
export default sectionSlice.reducer;
