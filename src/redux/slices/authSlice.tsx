import { createSlice } from "@reduxjs/toolkit";

interface AuthState {
  token: string | null;
  refreshToken: string | null;
  email: string | null;
  fullName: string | null;
  firstName: string | null;
  lastName: string | null;
  phoneNumber: string | number | null;
  isNewUser: boolean;
  enablePasskeyTopStrip: boolean;
  isPasskeyEnabled: boolean;
}

const initialState: AuthState = {
  token: null,
  refreshToken: null,
  email: null,
  fullName: null,
  firstName: null,
  lastName: null,
  phoneNumber: null,
  isNewUser: false,
  enablePasskeyTopStrip: false,
  isPasskeyEnabled: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login: (state, action) => {
      const profile = action?.payload?.data?.profile;
      const auth = action?.payload?.data?.auth;

      state.email = profile?.email ?? "";
      state.fullName = profile?.fullName ?? "";
      state.firstName = profile?.firstName ?? "";
      state.lastName = profile?.lastName ?? "";
      state.phoneNumber = profile?.phoneNumber ?? "";

      state.token = auth?.token ?? "";
      state.refreshToken = auth?.refreshToken ?? "";
      state.enablePasskeyTopStrip = false;
      state.isPasskeyEnabled = false;
    },
    logout: (state) => {
      state.token = null;
      state.refreshToken = null;
      state.email = null;
      state.fullName = null;
      state.firstName = null;
      state.lastName = null;
      state.phoneNumber = null;
      state.isNewUser = false;
      state.enablePasskeyTopStrip = false;
      state.isPasskeyEnabled = false;
    },
    updateProfile: (state, action) => {
      const profile = action?.payload?.data?.profile;
      const auth = action?.payload?.data?.auth;
      const passkey = action?.payload?.data?.passkey;

      state.email = profile?.email ?? state.email;
      state.fullName = profile?.fullName ?? state.fullName;
      state.firstName = profile?.firstName ?? state.firstName;
      state.lastName = profile?.lastName ?? state.lastName;
      state.phoneNumber = profile?.phoneNumber ?? state.phoneNumber;

      state.token = auth?.token ?? state.token;
      state.refreshToken = auth?.refreshToken ?? state.refreshToken;

      state.enablePasskeyTopStrip = passkey?.enablePasskeyTopStrip ?? state.enablePasskeyTopStrip;
      state.isPasskeyEnabled = passkey?.isPasskeyEnabled ?? state.isPasskeyEnabled;
    },
    setIsNewUser: (state, action) => {
      state.isNewUser = action.payload.isNewUser;
    },
  },
});

export type { AuthState };
export const { login, logout, updateProfile, setIsNewUser } = authSlice.actions;
export default authSlice.reducer;
