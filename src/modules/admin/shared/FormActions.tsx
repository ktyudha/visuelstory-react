import { useNavigate } from "react-router-dom";

interface Props {
  submitLabel?: string;
  isValid: boolean;
  isSubmitting: boolean;
}

/** Tombol Batal + Simpan standar untuk semua form admin. */
export default function FormActions({ submitLabel = "Simpan", isValid, isSubmitting }: Props) {
  const navigate = useNavigate();
  return (
    <div className="mt-2 flex flex-col-reverse justify-end gap-2 border-t border-gray-200 pt-5 dark:border-gray-700 sm:flex-row">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="cursor-pointer rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium hover:bg-gray-100 dark:border-gray-600 dark:text-white dark:hover:bg-gray-700"
      >
        Batal
      </button>
      <button
        type="submit"
        disabled={!isValid || isSubmitting}
        className="cursor-pointer rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {isSubmitting ? "Menyimpan..." : submitLabel}
      </button>
    </div>
  );
}
