import { useState } from "react";
import { toast } from "react-toastify";
import useDelete from "@services/admin/package-addon/hooks/useDelete";
import ConfirmDelete from "../../shared/ConfirmDelete";

interface Props {
  id: string;
  name: string;
  onOpen: boolean;
  onClose: () => void;
}

export default function Delete({ id, name, onOpen, onClose }: Props) {
  const { deleteData } = useDelete();
  const [busy, setBusy] = useState(false);

  const onDelete = async () => {
    setBusy(true);
    const { error } = await deleteData(id);
    setBusy(false);
    if (error) {
      toast.error(error === "Server error" ? "Gagal menghapus data." : error);
      return;
    }
    toast.success("Add-on berhasil dihapus.");
    onClose();
  };

  return (
    <ConfirmDelete
      open={onOpen}
      busy={busy}
      title={`Hapus add-on "${name}"?`}
      description="Add-on yang sudah dipakai di invoice tidak dapat dihapus. Tindakan ini tidak dapat dibatalkan."
      onConfirm={onDelete}
      onClose={onClose}
    />
  );
}
