import { useSyncExternalStore } from "react";

const KEY = "theme";
const listeners = new Set();

function systemTheme() {
  return window.matchMedia?.("(prefers-color-scheme: light)").matches
    ? "light"
    : "dark";
}

function stored() {
  try {
    const t = localStorage.getItem(KEY);
    return t === "light" || t === "dark" ? t : null;
  } catch {
    return null;
  }
}

export function getTheme() {
  return document.documentElement.dataset.theme || stored() || systemTheme();
}

function apply(theme) {
  document.documentElement.dataset.theme = theme;
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute("content", theme === "light" ? "#faf8f3" : "#0d0d0d");
  listeners.forEach((l) => l());
}

export function setTheme(theme) {
  try {
    localStorage.setItem(KEY, theme);
  } catch {
    /* private mode: the choice just won't persist */
  }
  apply(theme);
}

export function toggleTheme() {
  setTheme(getTheme() === "light" ? "dark" : "light");
}

// Follow the OS setting until the visitor makes an explicit choice
window.matchMedia?.("(prefers-color-scheme: light)").addEventListener?.(
  "change",
  () => {
    if (!stored()) apply(systemTheme());
  }
);

function subscribe(cb) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export function useTheme() {
  return useSyncExternalStore(subscribe, getTheme, () => "dark");
}
