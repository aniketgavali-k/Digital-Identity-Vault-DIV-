import React, { createContext, useContext, useState, useEffect } from 'react';
import { Appearance } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(Appearance.getColorScheme() === 'dark');

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    const savedTheme = await SecureStore.getItemAsync('theme');
    if (savedTheme) {
      setIsDark(savedTheme === 'dark');
    }
  };

  const toggleTheme = async () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    await SecureStore.setItemAsync('theme', newTheme ? 'dark' : 'light');
  };

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
