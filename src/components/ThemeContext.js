import React, { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [colorblindMode, setColorblindMode] = useState("none"); // Modes: "none", "red-green", "blue-yellow"
  const [handMode, setHandMode] = useState('none'); // Default to "none" until selected
  const [darkMode, setDarkMode] = useState(false); // Dark mode state

  const setDarkModePreference = (enabled) => {
    setDarkMode(enabled);
    localStorage.setItem('darkMode', enabled);
  };

  const setMode = (mode) => {
    setColorblindMode(mode);
    localStorage.setItem("colorblindMode", mode);
  };

  const setHandModePreference = (mode) => {
    setHandMode(mode);
    localStorage.setItem("handMode", mode);
  };

  useEffect(() => {
    const storedMode = localStorage.getItem("colorblindMode") || "none";
    const storedHandMode = localStorage.getItem("handMode") || "none";
    const storedDarkMode = localStorage.getItem('darkMode') === 'true';
    setDarkMode(storedDarkMode);
    setColorblindMode(storedMode);
    setHandMode(storedHandMode);
  }, []);

  return (
    <ThemeContext.Provider
      value={{
        darkMode,
        setDarkMode: setDarkModePreference,
        colorblindMode,
        setMode,
        handMode,
        setHandMode: setHandModePreference, // Explicit setter for handMode
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    // Safe fallback
    return {
      colorblindMode: "none",
      setMode: () => {},
      handMode: "none",
      setHandMode: () => {},
    };
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