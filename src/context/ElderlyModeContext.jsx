import { createContext, useContext, useState } from 'react';

const ElderlyModeContext = createContext();

export function useElderlyMode() {
  const context = useContext(ElderlyModeContext);
  if (!context) {
    throw new Error('useElderlyMode must be used within ElderlyModeProvider');
  }
  return context;
}

export function ElderlyModeProvider({ children }) {
  const [elderlyMode, setElderlyMode] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('en');

  const languages = [
    { code: 'en', label: '🇸🇬 English', name: 'English' },
    { code: 'zh', label: '中文', name: '中文' },
    { code: 'ms', label: 'Melayu', name: 'Bahasa Melayu' },
    { code: 'ta', label: 'தமிழ்', name: 'Tamil' },
  ];

  const value = {
    elderlyMode,
    setElderlyMode,
    toggleElderlyMode: () => setElderlyMode((prev) => !prev),
    selectedLanguage,
    setSelectedLanguage,
    languages,
  };

  return (
    <ElderlyModeContext.Provider value={value}>
      {children}
    </ElderlyModeContext.Provider>
  );
}