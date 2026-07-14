"use client";

import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISS_KEY = "install-prompt-dismissed";

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isIos, setIsIos] = useState(false);
  const [dismissed, setDismissed] = useState(true);
  const [standalone, setStandalone] = useState(true);

  useEffect(() => {
    const alreadyStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone ===
        true;
    setStandalone(alreadyStandalone);
    setDismissed(localStorage.getItem(DISMISS_KEY) === "1");
    setIsIos(/iphone|ipad|ipod/i.test(window.navigator.userAgent));

    function handleBeforeInstallPrompt(e: Event) {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    }
    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    return () =>
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
  }, []);

  function dismiss() {
    localStorage.setItem(DISMISS_KEY, "1");
    setDismissed(true);
  }

  async function handleInstall() {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
  }

  if (standalone || dismissed) return null;
  if (!deferredPrompt && !isIos) return null;

  return (
    <div className="flex items-center justify-between gap-3 border-b border-zinc-200 bg-zinc-50 px-4 py-2 text-xs dark:border-zinc-800 dark:bg-zinc-900">
      {deferredPrompt ? (
        <>
          <span>Install this app for quick access and offline viewing.</span>
          <div className="flex shrink-0 items-center gap-3">
            <button
              type="button"
              onClick={handleInstall}
              className="rounded-md bg-blue-600 px-2 py-1 font-medium text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
            >
              Install
            </button>
            <button type="button" onClick={dismiss} className="text-zinc-500">
              Dismiss
            </button>
          </div>
        </>
      ) : (
        <>
          <span>
            Install: tap the Share icon, then &quot;Add to Home Screen&quot;.
          </span>
          <button type="button" onClick={dismiss} className="shrink-0 text-zinc-500">
            Dismiss
          </button>
        </>
      )}
    </div>
  );
}
