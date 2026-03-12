"use client";

import React, { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import type { Difficulty } from "@/game/types";

interface Settings {
  soundEnabled: boolean;
  cardBackStyle: "classic" | "elegant" | "modern";
  difficulty: Difficulty;
  playerName: string;
}

interface SettingsContextType {
  settings: Settings;
  updateSettings: (updates: Partial<Settings>) => void;
}

const defaultSettings: Settings = {
  soundEnabled: true,
  cardBackStyle: "classic",
  difficulty: "medium",
  playerName: "Guest",
};

const SettingsContext = createContext<SettingsContextType>({
  settings: defaultSettings,
  updateSettings: () => {},
});

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("poker-settings");
    if (saved) {
      try {
        setSettings({ ...defaultSettings, ...JSON.parse(saved) });
      } catch {
        // ignore invalid JSON
      }
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) {
      localStorage.setItem("poker-settings", JSON.stringify(settings));
    }
  }, [settings, loaded]);

  const updateSettings = (updates: Partial<Settings>) => {
    setSettings((prev) => ({ ...prev, ...updates }));
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  return useContext(SettingsContext);
}
