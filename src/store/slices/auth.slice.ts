import { User } from "@services/auth/interfaces/login.type";
import { type StateCreator } from "zustand";

export declare interface AuthState {
  //   role: "admin" | "supplier" | "partner" | "reader";
  //   setRole: (role: "admin" | "supplier" | "partner" | "reader") => void;
  me?: User;
  setMe: (user: User) => void;
  isLoggedIn: boolean;
  setIsLoggedIn: (isLoggedIn: boolean) => void;
}

const createAuthSlice: StateCreator<AuthState> = (set) => ({
  //   role: "partner",
  //   setRole: (role) => set({ role }),
  isLoggedIn: false,
  setIsLoggedIn: (isLoggedIn: boolean) => set({ isLoggedIn }),
  me: undefined,
  setMe: (user) => set({ me: user }),
});

export default createAuthSlice;
