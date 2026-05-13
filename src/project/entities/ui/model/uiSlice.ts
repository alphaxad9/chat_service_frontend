// uiSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ThemeState {
  isDark: boolean;
}

// Get initial theme from localStorage
const getInitialTheme = (): boolean => {
  try {
    const stored = localStorage.getItem('theme-is-dark');
    return stored === 'true';
  } catch (e) {
    console.error("Could not read theme from localStorage", e);
    return false; // default: light
  }
};

const initialState: ThemeState = {
  isDark: getInitialTheme(),
};

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    toggleTheme: (state) => {
      state.isDark = !state.isDark;
      try {
        localStorage.setItem('theme-is-dark', String(state.isDark));
      } catch (e) {
        console.error("Could not save theme to localStorage", e);
      }
    },
    // Use this to set theme from external source (e.g., profile)
    setTheme: (state, action: PayloadAction<boolean>) => {
      state.isDark = action.payload;
      try {
        localStorage.setItem('theme-is-dark', String(state.isDark));
      } catch (e) {
        console.error("Could not save theme to localStorage", e);
      }
    },
  },
});

export const { toggleTheme, setTheme } = themeSlice.actions;
export default themeSlice.reducer;
export type { ThemeState };