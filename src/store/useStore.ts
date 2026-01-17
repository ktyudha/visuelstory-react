import { create } from "zustand";
import createAuthSlice, { type AuthState } from "./slices/auth.slice";
import createAdminSelectStateSlice, {
  type AdminSelectState,
} from "./slices/select.slice";

type BoundSliceTypes = { default: null } & AuthState & AdminSelectState;

const useGlobalStore = create<BoundSliceTypes>()((...setter) => ({
  default: null,
  ...createAuthSlice(...setter),
  ...createAdminSelectStateSlice(...setter),
}));

export default useGlobalStore;
