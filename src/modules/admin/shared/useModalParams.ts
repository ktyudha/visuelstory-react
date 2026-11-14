import { useCallback } from "react";
import { useSearchParams } from "react-router-dom";

/** Status modal tambah/ubah disimpan di URL: ?new=1 atau ?edit=ID (bisa dibuka lewat link). */
export function useModalParams() {
  const [params, setParams] = useSearchParams();
  const editId = params.get("edit");
  const isNew = params.get("new") === "1";

  const openCreate = useCallback(() => setParams({ new: "1" }), [setParams]);
  const openEdit = useCallback((id: string) => setParams({ edit: id }), [setParams]);
  const close = useCallback(() => setParams({}, { replace: true }), [setParams]);

  return { open: isNew || !!editId, isNew, editId, openCreate, openEdit, close };
}
