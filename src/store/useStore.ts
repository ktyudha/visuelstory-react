import { create } from "zustand";
import createAuthSlice, { type AuthState } from "./slices/auth.slice";

type BoundSliceTypes = { default: null } & AuthState;

const useGlobalStore = create<BoundSliceTypes>()((...setter) => ({
  default: null,
  ...createAuthSlice(...setter),
}));

export default useGlobalStore;
