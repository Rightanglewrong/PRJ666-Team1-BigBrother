import React, { createContext, useContext, useState, useEffect } from 'react';

// Create the Hand Mode Context
const HandModeContext = createContext();

// Custom Hook to use the Hand Mode Context
export const useHandMode = () => useContext(HandModeContext);

// Hand Mode Provider
export const HandModeProvider = ({ children }) => {
  const [handMode, setHandMode] = useState('none'); // Default to 'none'

  // Load hand mode from localStorage on mount
  useEffect(() => {
    const savedHandMode = localStorage.getItem('handMode') || 'none';
    setHandMode(savedHandMode);
  }, []);

  // Save hand mode to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('handMode', handMode);
  }, [handMode]);

  return (
    <HandModeContext.Provider value={{ handMode, setHandMode }}>
      {children}
    </HandModeContext.Provider>
  );
};