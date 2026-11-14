import { useState } from "react";
import { toast } from "react-toastify";
import useDelete from "@services/admin/invoice/hooks/useDelete";
import ConfirmDelete from "../../shared/ConfirmDelete";

interface Props {
  id: string;
  invoice_number: string;
  onOpen: boolean;
  onClose: () => void;
}

export default function Delete({ id, invoice_number, onOpen, onClose }: Props) {
  const { deleteData } = useDelete();
  const [busy, setBusy] = useState(false);

  const onDelete = async () => {
    setBusy(true);
    const { error } = await deleteData(id);
    setBusy(false);
    if (error) {
      toast.error("Gagal menghapus invoice.");
      return;
    }
    toast.success("Invoice berhasil dihapus.");
    onClose();
  };

  return (
    <ConfirmDelete
      open={onOpen}
      busy={busy}
      title={`Hapus invoice ${invoice_number}?`}
      description="Riwayat pembayaran dan jadwal acara pada invoice ini ikut terhapus. Tindakan ini tidak dapat dibatalkan."
      onConfirm={onDelete}
      onClose={onClose}
    />
  );
}
