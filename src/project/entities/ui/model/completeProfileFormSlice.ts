import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { FormState } from "../../../pages/profile/first_profile_complete/large_screen/helpers/helpers";

const initialState: FormState = {
  bio: null,
  profession: null,
  account_type: "public",
  date_of_birth: null,
  gender: null,
  phone: "+324 324 00000",
  location: null,
  language: null,
  theme: "system",
  cover_image: null,
  first_name: "",
  last_name: "",
  profileImage: null,
  dateOfBirth: { day: "", month: "", year: "" },
  locationOption: null,
  languageOption: null,
};

const completeProfileFormSlice = createSlice({
  name: "completeProfileForm",
  initialState,
  reducers: {
    setFormField: <
      K extends keyof FormState
    >(
      state: FormState,
      action: PayloadAction<{ key: K; value: FormState[K] }>
    ) => {
      state[action.payload.key] = action.payload.value;
    },

    setFormState: (_, action: PayloadAction<FormState>) => action.payload,

    resetForm: () => initialState,
  },
});

export const { setFormField, setFormState, resetForm } =
  completeProfileFormSlice.actions;

export default completeProfileFormSlice.reducer;
