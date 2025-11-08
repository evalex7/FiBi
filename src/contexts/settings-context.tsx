'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';

export type ChartSettings = {
  incomeVsExpense: boolean;
  dailyVaseExpense: boolean;
  category: boolean;
  trend: boolean;
  categoryTrend: boolean;
};

interface SettingsContextType {
  chartSettings: ChartSettings;
  setChartSettings: React.Dispatch<React.SetStateAction<ChartSettings>>;
}

const defaultChartSettings: ChartSettings = {
  incomeVsExpense: true,
  dailyVaseExpense: true,
  category: true,
  trend: true,
  categoryTrend: true,
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const [chartSettings, setChartSettings] = useState<ChartSettings>(() => {
    if (typeof window === 'undefined') {
      return defaultChartSettings;
    }
    try {
      const item = window.localStorage.getItem('chartSettings');
      return item ? JSON.parse(item) : defaultChartSettings;
    } catch (error) {
      console.error(error);
      return defaultChartSettings;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem('chartSettings', JSON.stringify(chartSettings));
    } catch (error) {
      console.error(error);
    }
  }, [chartSettings]);

  const value = useMemo(() => ({ chartSettings, setChartSettings }), [chartSettings]);

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
