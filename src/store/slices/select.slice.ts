import { StateCreator } from "zustand";

export declare interface AdminSelectState {
  isAllSelected: boolean;
  selectedIds: string[];

  setIsSelectedId: (param: string) => void;
  setIsAllSelected: (param: boolean) => void;
  setSelectedIds: (param: string[]) => void;
  clearSelectedIds: () => void;
}

const createAdminSelectStateSlice: StateCreator<AdminSelectState> = (
  set,
  get
) => ({
  isAllSelected: false,
  selectedIds: [],

  setSelectedIds: (param) => set({ selectedIds: param }),
  setIsSelectedId: (id) => {
    const current = get().selectedIds;
    const exists = current.includes(id);

    const updated = exists
      ? current.filter((item) => item !== id)
      : [...current, id];

    set({ selectedIds: updated });
  },
  clearSelectedIds: () => set({ selectedIds: [] }),
  setIsAllSelected: (param) => set({ isAllSelected: param }),
});

export default createAdminSelectStateSlice;
