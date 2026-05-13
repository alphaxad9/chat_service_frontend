import { createSlice } from '@reduxjs/toolkit';

// Define state shape
interface AuthUiState {
  view: 'login' | 'register';
  auth_loading: boolean;
}

// Initial state
const initialState: AuthUiState = {
  view: 'login', // default to login
  auth_loading: false, // default to not loading
};

// Create slice
const authUiSlice = createSlice({
  name: 'authUi',
  initialState,
  reducers: {
    setLoginView(state) {
      state.view = 'login';
    },
    setRegisterView(state) {
      state.view = 'register';
    },
    toggleView(state) {
      state.view = state.view === 'login' ? 'register' : 'login';
    },
    startAuthLoading(state) {
      state.auth_loading = true;
    },
    stopAuthLoading(state) {
      state.auth_loading = false;
    },
    triggerAuthLoading(state) {
      state.auth_loading = true;
      // This is a simplified approach; the timeout will be handled in the component or middleware
    },
  },
});
// Export actions
export const { setLoginView, setRegisterView, toggleView, startAuthLoading, stopAuthLoading, triggerAuthLoading } = authUiSlice.actions;

// Export reducer
export default authUiSlice.reducer;