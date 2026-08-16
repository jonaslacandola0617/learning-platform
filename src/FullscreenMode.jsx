"use client";

import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";

function getFullscreenElement() {
  if (typeof document === "undefined") return null;
  return document.fullscreenElement || document.webkitFullscreenElement || null;
}

function canFullscreen() {
  if (typeof document === "undefined") return false;
  const root = document.documentElement;
  return Boolean(root.requestFullscreen || root.webkitRequestFullscreen);
}

async function enterFullscreen() {
  const root = document.documentElement;
  if (root.requestFullscreen) {
    try {
      await root.requestFullscreen({ navigationUI: "hide" });
    } catch {
      await root.requestFullscreen();
    }
    return;
  }
  if (root.webkitRequestFullscreen) {
    root.webkitRequestFullscreen();
    return;
  }
  throw new Error("Fullscreen is not supported in this browser.");
}

async function leaveFullscreen() {
  if (document.exitFullscreen) {
    await document.exitFullscreen();
    return;
  }
  if (document.webkitExitFullscreen) document.webkitExitFullscreen();
}

export function FullscreenMode({ children }) {
  const [dashboardTarget, setDashboardTarget] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [supported, setSupported] = useState(true);
  const [notice, setNotice] = useState("");

  const syncDashboardTarget = useCallback(() => {
    setDashboardTarget(document.querySelector(".platform-nav .nav-profile"));
  }, []);

  useEffect(() => {
    setSupported(canFullscreen());
    setIsFullscreen(Boolean(getFullscreenElement()));
    syncDashboardTarget();

    const observer = new MutationObserver(syncDashboardTarget);
    observer.observe(document.body, { childList: true, subtree: true });

    const syncFullscreen = () => {
      setIsFullscreen(Boolean(getFullscreenElement()));
      setNotice("");
    };
    document.addEventListener("fullscreenchange", syncFullscreen);
    document.addEventListener("webkitfullscreenchange", syncFullscreen);

    return () => {
      observer.disconnect();
      document.removeEventListener("fullscreenchange", syncFullscreen);
      document.removeEventListener("webkitfullscreenchange", syncFullscreen);
    };
  }, [syncDashboardTarget]);

  async function toggleFullscreen() {
    setNotice("");
    if (!canFullscreen()) {
      setSupported(false);
      setNotice("Full screen is not available in this browser.");
      return;
    }

    try {
      if (getFullscreenElement()) await leaveFullscreen();
      else await enterFullscreen();
    } catch {
      setNotice("Full screen was blocked. Tap again to try.");
    }
  }

  const dashboardControl = dashboardTarget ? createPortal(
    <div className="dashboard-fullscreen-wrap">
      <button
        className="dashboard-fullscreen"
        type="button"
        onClick={toggleFullscreen}
        disabled={!supported}
        aria-pressed={isFullscreen}
      >
        <span className="dashboard-fullscreen-icon" aria-hidden="true">⛶</span>
        <span>
          <strong>{isFullscreen ? "Exit full screen" : "Full screen"}</strong>
          <small>{isFullscreen ? "Return to browser view" : "Use more space"}</small>
        </span>
      </button>
      {notice && <span className="dashboard-fullscreen-notice" role="status">{notice}</span>}
    </div>,
    dashboardTarget,
  ) : null;

  return <>{children}{dashboardControl}</>;
}
