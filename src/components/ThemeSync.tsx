'use client';

import { useEffect } from 'react';
import { useTheme } from 'next-themes';

export default function ThemeSync() {
  const { setTheme } = useTheme();

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)');

    const listener = () => {
      setTheme(media.matches ? 'dark' : 'light');
    };

    // Initial check
    listener();

    media.addEventListener('change', listener);

    return () => media.removeEventListener('change', listener);
  }, [setTheme]);

  return null;
}
