/**
 * Sistem tema tunggal untuk admin & customer.
 * Menyimpan pilihan di localStorage (kunci sama dengan Flowbite agar tidak bentrok),
 * default TERANG; "auto" mengikuti pengaturan OS.
 */
export type ThemeMode = "light" | "dark" | "auto";

const KEY = "flowbite-theme-mode";
const listeners = new Set<() => void>();

export function getMode(): ThemeMode {
  try {
    const v = localStorage.getItem(KEY);
    if (v === "light" || v === "dark" || v === "auto") return v;
  } catch { /* storage diblokir */ }
  return "light";
}

export function isDarkNow(mode: ThemeMode = getMode()): boolean {
  return mode === "dark" || (mode === "auto" && window.matchMedia("(prefers-color-scheme: dark)").matches);
}

/** Terapkan ke <html>. Halaman yang memaksa terang (landing) memakai data-force-light. */
export function applyTheme() {
  const root = document.documentElement;
  const dark = root.dataset.forceLight ? false : isDarkNow();
  root.classList.toggle("dark", dark);
  root.style.colorScheme = dark ? "dark" : "light";
  document.querySelectorAll('meta[name="theme-color"]').forEach((m) => m.setAttribute("content", dark ? "#0a0a0a" : "#171717"));
  listeners.forEach((l) => l());
}

export function setMode(mode: ThemeMode) {
  try { localStorage.setItem(KEY, mode); } catch { /* abaikan */ }
  applyTheme();
}

export function subscribe(fn: () => void) {
  listeners.add(fn);
  return () => { listeners.delete(fn); };
}

export function initTheme() {
  applyTheme();
  window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => getMode() === "auto" && applyTheme());
  window.addEventListener("storage", (e) => e.key === KEY && applyTheme());
}
