'use client';

import { useEffect } from 'react';
import { useTheme } from 'next-themes';

export default function ThemeSync() {
  const { setTheme, theme } = useTheme();

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)');

    const updateTheme = () => {
      // Check if the user has selected the "system" theme
      if (theme === "system") {
        const newTheme = media.matches ? 'dark' : 'light';
        setTheme(newTheme);
      } else {
        // If a specific theme (light/dark) is chosen, ensure it is applied
        setTheme(theme as string);
      }
    };
    
    // Listener for browsers that support dynamic changes
    const changeListener = (e: MediaQueryListEvent) => {
        if (theme === "system") {
            setTheme(e.matches ? "dark" : "light");
        }
    };

    // Initial check
    updateTheme();
    
    // Add all listeners
    media.addEventListener('change', changeListener);
    window.addEventListener("visibilitychange", updateTheme);
    window.addEventListener("focus", updateTheme);


    // Cleanup
    return () => {
      media.removeEventListener('change', changeListener);
      window.removeEventListener("visibilitychange", updateTheme);
      window.removeEventListener("focus", updateTheme);
    };
  }, [theme, setTheme]);

  return null;
}
