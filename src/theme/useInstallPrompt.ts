import { useCallback, useEffect, useState } from "react";

/** True bila dibuka dari ikon layar utama (PWA), bukan tab browser. */
export const isStandalone = () =>
  window.matchMedia("(display-mode: standalone)").matches || (navigator as unknown as { standalone?: boolean }).standalone === true;

type PromptEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> };
const get = () => (window as unknown as { __installPrompt?: PromptEvent }).__installPrompt;

/** Status pemasangan PWA: bisa dipasang (Android/desktop), sudah terpasang, atau iOS (panduan manual). */
export function useInstallPrompt() {
  const [available, setAvailable] = useState(!!get());
  const standalone = isStandalone();
  const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);

  useEffect(() => {
    const on = () => setAvailable(!!get());
    window.addEventListener("install-available", on);
    return () => window.removeEventListener("install-available", on);
  }, []);

  const install = useCallback(async () => {
    const e = get();
    if (!e) return;
    await e.prompt();
    await e.userChoice;
    (window as unknown as { __installPrompt?: PromptEvent }).__installPrompt = undefined;
    setAvailable(false);
  }, []);

  return { available, install, standalone, ios };
}
