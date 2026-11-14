import { HiOutlineEye, HiOutlinePencil, HiOutlineTrash } from "react-icons/hi";

const base = "cursor-pointer rounded-lg p-2 text-gray-400 transition";

export default function RowActions({ onView, onEdit, onDelete }: { onView?: () => void; onEdit?: () => void; onDelete?: () => void }) {
  return (
    <div className="flex justify-end gap-1">
      {onView && (
        <button type="button" onClick={onView} aria-label="Lihat detail" title="Lihat detail" className={`${base} hover:bg-gray-100 hover:text-gray-700`}>
          <HiOutlineEye size={18} />
        </button>
      )}
      {onEdit && (
        <button type="button" onClick={onEdit} aria-label="Ubah" title="Ubah" className={`${base} hover:bg-blue-50 hover:text-blue-600`}>
          <HiOutlinePencil size={18} />
        </button>
      )}
      {onDelete && (
        <button type="button" onClick={onDelete} aria-label="Hapus" title="Hapus" className={`${base} hover:bg-red-50 hover:text-red-600`}>
          <HiOutlineTrash size={18} />
        </button>
      )}
    </div>
  );
}
