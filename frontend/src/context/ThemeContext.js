"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

const ThemeContext = createContext(undefined);

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState("system");
  const [resolvedTheme, setResolvedTheme] = useState("light");

  const applyTheme = useCallback((mode) => {
    let resolved = mode;
    if (mode === "system") {
      resolved =
        typeof window !== "undefined" &&
        window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light";
    }
    setResolvedTheme(resolved);
    if (typeof document !== "undefined") {
      const root = document.documentElement;
      root.classList.remove("light", "dark");
      root.classList.add(resolved);
      root.setAttribute("data-theme", resolved);
      root.style.colorScheme = resolved;
    }
  }, []);

  const setTheme = useCallback(
    (mode) => {
      setThemeState(mode);
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("livio-theme", mode);
        } catch (e) {}
      }
      applyTheme(mode);
    },
    [applyTheme]
  );

  useEffect(() => {
    let saved = "system";
    try {
      saved = localStorage.getItem("livio-theme") || "system";
    } catch (e) {}
    setThemeState(saved);
    applyTheme(saved);

    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => {
      let current = "system";
      try {
        current = localStorage.getItem("livio-theme") || "system";
      } catch (e) {}
      if (current === "system") {
        applyTheme("system");
      }
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [applyTheme]);

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    return { theme: "system", resolvedTheme: "light", setTheme: () => {} };
  }
  return context;
}
