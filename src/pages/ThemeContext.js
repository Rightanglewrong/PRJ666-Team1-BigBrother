import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  console.log("ThemeProvider rendered"); // Debugging log for development
  const [isColourblindMode, setIsColourblindMode] = useState(false);

  const toggleColourblindMode = () => {
    setIsColourblindMode((prev) => {
      const nextMode = !prev;
      localStorage.setItem('isColourblindMode', nextMode); // Store the updated state
      return nextMode;
    });
  };

  useEffect(() => {
    const storedMode = localStorage.getItem('isColourblindMode');
    setIsColourblindMode(storedMode === 'true' || false); // Ensure fallback to `false`
  }, []);

  return (
    <ThemeContext.Provider value={{ isColourblindMode, toggleColourblindMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    console.error('useTheme must be used within a ThemeProvider');
    return { isColourblindMode: false, toggleColourblindMode: () => {} }; // Fallback values
  }
  return context;
};