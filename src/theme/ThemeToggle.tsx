import { Monitor, Moon, Sun } from "lucide-react";
import clsx from "clsx";
import { useTheme } from "./useTheme";
import type { ThemeMode } from "./theme";

const OPTIONS: { value: ThemeMode; label: string; icon: typeof Sun }[] = [
  { value: "light", label: "Terang", icon: Sun },
  { value: "dark", label: "Gelap", icon: Moon },
  { value: "auto", label: "Otomatis", icon: Monitor },
];

/** variant="segmented": 3 pilihan (halaman Akun). variant="icon": tombol siklus ringkas (header). */
export default function ThemeToggle({ variant = "icon", className }: { variant?: "icon" | "segmented"; className?: string }) {
  const { mode, setMode } = useTheme();

  if (variant === "segmented") {
    return (
      <div role="radiogroup" aria-label="Tema tampilan" className={clsx("grid grid-cols-3 gap-1 rounded-xl bg-neutral-100 p-1 dark:bg-neutral-800", className)}>
        {OPTIONS.map(({ value, label, icon: Icon }) => (
          <button key={value} role="radio" aria-checked={mode === value} onClick={() => setMode(value)}
            className={clsx("flex cursor-pointer flex-col items-center gap-1 rounded-lg px-2 py-2.5 text-xs font-medium transition",
              mode === value ? "bg-white text-neutral-900 shadow-sm dark:bg-neutral-700 dark:text-white" : "text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white")}>
            <Icon className="size-5" /> {label}
          </button>
        ))}
      </div>
    );
  }

  const idx = OPTIONS.findIndex((o) => o.value === mode);
  const next = OPTIONS[(idx + 1) % OPTIONS.length];
  const Current = OPTIONS[idx].icon;
  return (
    <button onClick={() => setMode(next.value)} aria-label={`Tema: ${OPTIONS[idx].label}. Ketuk untuk ${next.label}`} title={`Tema: ${OPTIONS[idx].label}`}
      className={clsx("grid size-9 cursor-pointer place-items-center rounded-lg text-white/70 hover:bg-white/10 hover:text-white", className)}>
      <Current className="size-4" />
    </button>
  );
}
