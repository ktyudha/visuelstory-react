import { useState } from "react";
import { toast } from "react-toastify";
import useDeletePackageCategory from "@services/admin/package-category/hooks/useDeletePackageCategory";
import ConfirmDelete from "../../shared/ConfirmDelete";

interface Props {
  id: string;
  name: string;
  onOpen: boolean;
  onClose: () => void;
}

export default function Delete({ id, name, onOpen, onClose }: Props) {
  const { deletePackageCategory } = useDeletePackageCategory();
  const [busy, setBusy] = useState(false);

  const onDelete = async () => {
    setBusy(true);
    const { error } = await deletePackageCategory(id);
    setBusy(false);
    if (error) {
      toast.error(error === "Server error" ? "Gagal menghapus data." : error);
      return;
    }
    toast.success("Kategori berhasil dihapus.");
    onClose();
  };

  return (
    <ConfirmDelete
      open={onOpen}
      busy={busy}
      title={`Hapus kategori "${name}"?`}
      description="Kategori yang masih memiliki paket tidak dapat dihapus. Tindakan ini tidak dapat dibatalkan."
      onConfirm={onDelete}
      onClose={onClose}
    />
  );
}
