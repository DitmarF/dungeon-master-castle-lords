"use client";

import { useEffect } from "react";
import { useGame } from "../game/GameProvider";
import { GameIcon } from "./GameIcon";

interface SettingsSheetProps {
  onClose: () => void;
}

export function SettingsSheet({ onClose }: SettingsSheetProps) {
  const {
    darkMode,
    themePreference,
    setDarkMode,
    useSystemTheme,
  } = useGame();

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div
      className="modal-backdrop settings-sheet-backdrop"
      role="presentation"
      onMouseDown={onClose}
    >
      <section
        className="settings-sheet"
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-sheet-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="settings-sheet__header">
          <span className="settings-sheet__mark">
            <GameIcon name="settings" size={23} />
          </span>
          <div>
            <span className="section-kicker">Game settings</span>
            <h2 id="settings-sheet-title">General</h2>
          </div>
          <button
            type="button"
            className="settings-sheet__close"
            onClick={onClose}
            aria-label="Close game settings"
          >
            ×
          </button>
        </header>

        <div className="settings-option">
          <span className="settings-option__icon">
            <GameIcon name={darkMode ? "moon" : "sun"} size={20} />
          </span>
          <span className="settings-option__copy">
            <strong>Dark mode</strong>
            <small>
              {themePreference === "system"
                ? "Following this device until you change it."
                : "Saved on this device."}
            </small>
          </span>
          <button
            type="button"
            className="theme-switch"
            role="switch"
            aria-checked={darkMode}
            aria-label="Dark mode"
            onClick={() => setDarkMode(!darkMode)}
          >
            <span aria-hidden="true"><i /></span>
            <strong>{darkMode ? "On" : "Off"}</strong>
          </button>
        </div>

        <footer className="settings-sheet__footer">
          <span>
            <GameIcon name="device" size={16} />
            {themePreference === "system" ? "System default" : "Manual choice"}
          </span>
          {themePreference !== "system" ? (
            <button type="button" onClick={useSystemTheme}>
              Use device setting
            </button>
          ) : null}
        </footer>
      </section>
    </div>
  );
}
