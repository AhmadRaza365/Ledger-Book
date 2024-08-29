import { createSlice } from "@reduxjs/toolkit";

interface OnBoardState {
  isFirstUser: boolean;
  showOnBoarding: boolean;
}

const initialState: OnBoardState = {
  isFirstUser: true,
  showOnBoarding: true,
};

const onBoardingSlice = createSlice({
  name: "onBoarding",
  initialState,
  reducers: {
    setIsFirstUser: (state, action) => {
      state.isFirstUser = action.payload.isFirstUser;
    },
    setShowOnBoarding: (state, action) => {
      state.showOnBoarding = action.payload.showOnBoarding;
    },
  },
});

export type { OnBoardState };
export const { setIsFirstUser, setShowOnBoarding } = onBoardingSlice.actions;
export default onBoardingSlice.reducer;
