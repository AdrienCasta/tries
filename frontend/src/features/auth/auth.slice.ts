import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type ProfileStatus = "incomplete" | "completed";

export interface User {
  id: string;
  email: string;
  emailConfirmed: boolean;
  profileStatus: ProfileStatus;
  firstname?: string;
  lastname?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

const loadUserFromStorage = (): User | null => {
  const storedUser = localStorage.getItem("user");
  if (storedUser) {
    try {
      const parsed = JSON.parse(storedUser);
      return {
        ...parsed,
        emailConfirmed: parsed.emailConfirmed ?? false,
        profileStatus: parsed.profileStatus ?? "incomplete",
      };
    } catch {
      return null;
    }
  }
  return null;
};

const initialState: AuthState = {
  user: loadUserFromStorage(),
  isAuthenticated: !!loadUserFromStorage(),
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      localStorage.setItem("user", JSON.stringify(action.payload));
    },
    updateUserProfile: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
        localStorage.setItem("user", JSON.stringify(state.user));
      }
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      localStorage.removeItem("user");
    },
  },
});

export const { setUser, updateUserProfile, logout } = authSlice.actions;
export default authSlice.reducer;
