import { useSyncExternalStore } from "react";
import { getMode, isDarkNow, setMode, subscribe } from "./theme";

export function useTheme() {
  const mode = useSyncExternalStore(subscribe, getMode, () => "light" as const);
  const dark = useSyncExternalStore(subscribe, () => isDarkNow(), () => false);
  return { mode, dark, setMode };
}
