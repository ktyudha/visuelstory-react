import { User } from "@modules/auth/services/interfaces/login.types";
import { type StateCreator } from "zustand";

export declare interface AuthState {
  email: string;
  setEmail: (param: string) => void;
  whatsapp: string;
  setWhatsapp: (param: string) => void;
  role: "admin" | "customer";
  setRole: (role: "admin" | "customer") => void;
  me?: User;
  setMe: (user: User) => void;
  isLoggedIn: boolean;
  setIsLoggedIn: (isLoggedIn: boolean) => void;
}

const createAuthSlice: StateCreator<AuthState> = (set) => ({
  email: "",
  whatsapp: "",
  setEmail: (param) => set({ email: param }),
  setWhatsapp: (param) => set({ whatsapp: param }),
  role: "customer",
  setRole: (role) => set({ role }),
  isLoggedIn: false,
  setIsLoggedIn: (isLoggedIn: boolean) => set({ isLoggedIn }),
  me: undefined,
  setMe: (user) => set({ me: user }),
});

export default createAuthSlice;
