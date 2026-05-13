import { createSlice, PayloadAction } from "@reduxjs/toolkit";


const getInitialDarkMode = (): boolean => {
  const storedValue = localStorage.getItem("darkMode");
  return storedValue === null ? false : JSON.parse(storedValue);
};

interface ThemeState {
  darkMode: boolean;
}

const initialState: ThemeState = {
  darkMode: getInitialDarkMode(),
};

const themeSlice = createSlice({
  name: "theme",
  initialState,
  reducers: {
    toggleDarkMode: (state) => {
    state.darkMode = !state.darkMode; // ✅ Toggle
      localStorage.setItem("darkMode", JSON.stringify(state.darkMode));
    },
    
    setDarkMode: (state, action: PayloadAction<boolean>) => {
      state.darkMode = action.payload;
      localStorage.setItem("darkMode", JSON.stringify(action.payload));
    },
  },
});

export const { toggleDarkMode, setDarkMode } = themeSlice.actions;
export default themeSlice.reducer;
