"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const KID_MODE_KEY = "tuklas.kid-mode-active";
const HISTORY_GUARD_KEY = "__tuklasKidLock";
const HOLD_TO_EXIT_MS = 2200;

function getFullscreenElement() {
  if (typeof document === "undefined") return null;
  return document.fullscreenElement || document.webkitFullscreenElement || null;
}

function canFullscreen() {
  if (typeof document === "undefined") return false;
  const root = document.documentElement;
  return Boolean(root.requestFullscreen || root.webkitRequestFullscreen);
}

async function requestAppFullscreen() {
  const root = document.documentElement;
  if (root.requestFullscreen) {
    await root.requestFullscreen({ navigationUI: "hide" }).catch(async () => root.requestFullscreen());
    return;
  }
  if (root.webkitRequestFullscreen) {
    root.webkitRequestFullscreen();
    return;
  }
  throw new Error("Fullscreen is not supported in this browser.");
}

async function exitAppFullscreen() {
  if (document.exitFullscreen) {
    await document.exitFullscreen();
    return;
  }
  if (document.webkitExitFullscreen) document.webkitExitFullscreen();
}

function getHistoryState() {
  if (typeof window === "undefined") return {};
  const state = window.history.state;
  return state && typeof state === "object" ? state : {};
}

export function KidMode({ children }) {
  const [modeActive, setModeActive] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [parentPanelOpen, setParentPanelOpen] = useState(false);
  const [holdProgress, setHoldProgress] = useState(0);
  const [fullscreenAvailable, setFullscreenAvailable] = useState(true);
  const [notice, setNotice] = useState("");
  const holdTimer = useRef(null);
  const holdFrame = useRef(null);
  const holdStartedAt = useRef(0);
  const wakeLock = useRef(null);
  const historyGuardEnabled = useRef(false);

  const releaseWakeLock = useCallback(async () => {
    try {
      await wakeLock.current?.release?.();
    } catch {
      // The browser may already have released it.
    }
    wakeLock.current = null;
  }, []);

  const requestWakeLock = useCallback(async () => {
    if (!("wakeLock" in navigator) || document.visibilityState !== "visible") return;
    try {
      wakeLock.current = await navigator.wakeLock.request("screen");
    } catch {
      // Wake Lock is optional; fullscreen/kid lock still works without it.
    }
  }, []);

  const pushHistoryGuard = useCallback(() => {
    if (typeof window === "undefined") return;
    const state = getHistoryState();
    if (state[HISTORY_GUARD_KEY]) return;
    window.history.pushState({ ...state, [HISTORY_GUARD_KEY]: true }, "", window.location.href);
  }, []);

  useEffect(() => {
    setFullscreenAvailable(canFullscreen());
    setIsFullscreen(Boolean(getFullscreenElement()));
    try {
      setModeActive(window.sessionStorage.getItem(KID_MODE_KEY) === "1");
    } catch {
      // Session storage is optional.
    }

    const syncFullscreen = () => setIsFullscreen(Boolean(getFullscreenElement()));
    document.addEventListener("fullscreenchange", syncFullscreen);
    document.addEventListener("webkitfullscreenchange", syncFullscreen);
    return () => {
      document.removeEventListener("fullscreenchange", syncFullscreen);
      document.removeEventListener("webkitfullscreenchange", syncFullscreen);
    };
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("tuklas-kid-mode", modeActive);
    document.body.classList.toggle("tuklas-kid-mode", modeActive);

    try {
      if (modeActive) window.sessionStorage.setItem(KID_MODE_KEY, "1");
      else window.sessionStorage.removeItem(KID_MODE_KEY);
    } catch {
      // Session storage is optional.
    }

    if (modeActive && isFullscreen) requestWakeLock();
    else releaseWakeLock();

    return () => {
      if (!modeActive) releaseWakeLock();
    };
  }, [isFullscreen, modeActive, releaseWakeLock, requestWakeLock]);

  useEffect(() => {
    if (!modeActive) {
      historyGuardEnabled.current = false;
      return undefined;
    }

    historyGuardEnabled.current = true;
    pushHistoryGuard();

    const blockBrowserBack = () => {
      if (!historyGuardEnabled.current) return;
      const state = getHistoryState();
      window.history.pushState({ ...state, [HISTORY_GUARD_KEY]: true }, "", window.location.href);
    };

    window.addEventListener("popstate", blockBrowserBack);
    return () => {
      historyGuardEnabled.current = false;
      window.removeEventListener("popstate", blockBrowserBack);
    };
  }, [modeActive, pushHistoryGuard]);

  useEffect(() => {
    const handleVisibility = () => {
      if (modeActive && isFullscreen && document.visibilityState === "visible") requestWakeLock();
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, [isFullscreen, modeActive, requestWakeLock]);

  const stopHold = useCallback(() => {
    if (holdTimer.current) clearTimeout(holdTimer.current);
    if (holdFrame.current) cancelAnimationFrame(holdFrame.current);
    holdTimer.current = null;
    holdFrame.current = null;
    holdStartedAt.current = 0;
    setHoldProgress(0);
  }, []);

  const unlock = useCallback(async () => {
    stopHold();
    historyGuardEnabled.current = false;

    let collapseGuardEntry = false;
    try {
      const state = getHistoryState();
      collapseGuardEntry = Boolean(state[HISTORY_GUARD_KEY]);
      if (collapseGuardEntry) {
        const nextState = { ...state };
        delete nextState[HISTORY_GUARD_KEY];
        window.history.replaceState(nextState, "", window.location.href);
      }
    } catch {
      // The history guard is best-effort and should never block a parent exit.
    }

    setModeActive(false);
    setParentPanelOpen(false);
    setNotice("");
    await releaseWakeLock();
    try {
      if (getFullscreenElement()) await exitAppFullscreen();
    } catch {
      // State is still unlocked even if the browser already left fullscreen.
    }

    if (collapseGuardEntry) {
      window.setTimeout(() => {
        try {
          window.history.back();
        } catch {
          // Ignore browsers that reject the cleanup navigation.
        }
      }, 0);
    }
  }, [releaseWakeLock, stopHold]);

  const startHold = useCallback(() => {
    if (holdTimer.current) return;
    holdStartedAt.current = performance.now();
    setHoldProgress(1);

    const animate = () => {
      const elapsed = performance.now() - holdStartedAt.current;
      setHoldProgress(Math.min(100, (elapsed / HOLD_TO_EXIT_MS) * 100));
      if (elapsed < HOLD_TO_EXIT_MS) holdFrame.current = requestAnimationFrame(animate);
    };
    holdFrame.current = requestAnimationFrame(animate);
    holdTimer.current = setTimeout(unlock, HOLD_TO_EXIT_MS);
  }, [unlock]);

  useEffect(() => stopHold, [stopHold]);

  async function enterKidMode() {
    setNotice("");
    if (!canFullscreen()) {
      setFullscreenAvailable(false);
      setNotice("Full screen is not available in this browser.");
      return;
    }

    try {
      // Keep the lock state even if the browser later leaves fullscreen by Escape/swipe.
      setModeActive(true);
      await requestAppFullscreen();
      setIsFullscreen(true);
      setParentPanelOpen(false);
    } catch {
      setModeActive(false);
      setNotice("Full screen was blocked. Tap the button again to allow it.");
    }
  }

  async function returnToFullscreen() {
    setNotice("");
    try {
      await requestAppFullscreen();
      setIsFullscreen(true);
      setParentPanelOpen(false);
    } catch {
      setNotice("Tap again to return to full screen.");
    }
  }

  const lockScreenVisible = modeActive && !isFullscreen;
  const panelVisible = modeActive && parentPanelOpen && isFullscreen;

  return (
    <div className={`kid-mode-root ${modeActive ? "is-kid-locked" : ""}`}>
      {children}

      {!modeActive && (
        <div className="kid-mode-launch-wrap">
          <button className="kid-mode-launch" type="button" onClick={enterKidMode} disabled={!fullscreenAvailable} aria-label="Enter full screen kid lock">
            <span className="kid-mode-launch-icon" aria-hidden="true">⛶</span>
            <span><strong>Full screen</strong><small>Kid Lock</small></span>
          </button>
          {notice && <span className="kid-mode-inline-notice" role="status">{notice}</span>}
        </div>
      )}

      {modeActive && isFullscreen && !parentPanelOpen && (
        <button className="kid-mode-status" type="button" onClick={() => setParentPanelOpen(true)} aria-label="Kid Lock is on. Open parent controls.">
          <span aria-hidden="true">🔒</span>
          <span>Kid Lock</span>
        </button>
      )}

      {panelVisible && (
        <div className="kid-mode-parent-backdrop" role="presentation" onPointerDown={(event) => {
          if (event.target === event.currentTarget) setParentPanelOpen(false);
        }}>
          <section className="kid-mode-parent-panel" role="dialog" aria-modal="true" aria-labelledby="kid-parent-title">
            <button className="kid-mode-close" type="button" onClick={() => setParentPanelOpen(false)} aria-label="Close parent controls">×</button>
            <span className="kid-mode-lock-mark" aria-hidden="true">🔒</span>
            <p className="kid-mode-eyebrow">PARENT CONTROLS</p>
            <h2 id="kid-parent-title">Tuklas is locked in full screen.</h2>
            <p>Games and Tuklas navigation still work normally. Hold the button below only when you are ready to leave Kid Lock.</p>
            <HoldToExitButton progress={holdProgress} onStart={startHold} onStop={stopHold} />
          </section>
        </div>
      )}

      {lockScreenVisible && (
        <div className="kid-mode-lock-screen" role="dialog" aria-modal="true" aria-labelledby="kid-lock-title">
          <div className="kid-mode-lock-art" aria-hidden="true"><i /><i /><i /></div>
          <section className="kid-mode-lock-card">
            <span className="kid-mode-lock-mark" aria-hidden="true">🔒</span>
            <p className="kid-mode-eyebrow">KID LOCK</p>
            <h2 id="kid-lock-title">Full screen was closed.</h2>
            <p>Tuklas stays locked so little hands cannot wander away from the learning app.</p>
            <button className="kid-mode-return" type="button" onClick={returnToFullscreen}>Return to full screen <span aria-hidden="true">⛶</span></button>
            <div className="kid-mode-parent-divider"><span>Parent exit</span></div>
            <HoldToExitButton progress={holdProgress} onStart={startHold} onStop={stopHold} />
            {notice && <span className="kid-mode-lock-notice" role="status">{notice}</span>}
          </section>
        </div>
      )}
    </div>
  );
}

function HoldToExitButton({ progress, onStart, onStop }) {
  return (
    <button
      className="kid-mode-hold-exit"
      type="button"
      onPointerDown={(event) => { event.currentTarget.setPointerCapture?.(event.pointerId); onStart(); }}
      onPointerUp={onStop}
      onPointerCancel={onStop}
      onPointerLeave={(event) => { if (event.buttons) onStop(); }}
      onKeyDown={(event) => {
        if ((event.key === " " || event.key === "Enter") && !event.repeat) {
          event.preventDefault();
          onStart();
        }
      }}
      onKeyUp={(event) => {
        if (event.key === " " || event.key === "Enter") onStop();
      }}
      style={{ "--hold-progress": `${progress}%` }}
      aria-label="Hold for two seconds to exit Kid Lock"
    >
      <span className="kid-mode-hold-fill" aria-hidden="true" />
      <strong>{progress > 0 ? "Keep holding…" : "Hold to exit Kid Lock"}</strong>
      <small>{progress > 0 ? `${Math.round(progress)}%` : "2 seconds"}</small>
    </button>
  );
}