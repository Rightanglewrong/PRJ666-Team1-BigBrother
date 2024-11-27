import React, { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [colorblindMode, setColorblindMode] = useState("none"); // Modes: "none", "red-green", "blue-yellow"

  const setMode = (mode) => {
    setColorblindMode(mode);
    localStorage.setItem("colorblindMode", mode);
  };

  useEffect(() => {
    const storedMode = localStorage.getItem("colorblindMode") || "none";
    setColorblindMode(storedMode);
  }, []);

  return (
    <ThemeContext.Provider value={{ colorblindMode, setMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    console.warn("useTheme called outside of ThemeProvider. Defaulting to 'none' mode.");
    return { colorblindMode: "none", setMode: () => {} }; // Safe fallback
  }
  return context;
};

const styles = {
  none: {
    background: "white",
    text: "black",
  },
  "red-green": {
    background: "#E8EAF6", // Light blue-gray
    text: "#311B92",       // Deep purple
  },
  "blue-yellow": {
    background: "#E5E5E5", // Light gray
    text: "#333333",       // Dark gray/black
    accent: "#FF6F61",     // Coral/red-orange
    secondaryAccent: "#2A9D8F", // Teal
  },
};

export const useThemeStyles = () => {
  const { colorblindMode } = useTheme();
  return styles[colorblindMode] || styles.none;
};